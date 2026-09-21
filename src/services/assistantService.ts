// src/services/assistantService.ts
//
// Task App-22: data layer untuk UI Asisten AI — memanggil POST
// /assistant/ask (Task Backend-06) yang sudah ada dan teruji, TIDAK ada
// perubahan logic backend sama sekali (batasan eksplisit task). Pola
// fetch-wrapper sama persis dengan crowdService.ts/nearbyStopsService.ts
// (custom Error subclass, cek network-error vs status non-ok) supaya
// konsisten satu gaya di seluruh services/.
import { fetchWithTimeout, RequestTimeoutError } from "@/utils/withTimeout";
import { API_BASE_URL } from "./apiConfig";

// Backend sendiri memotong panggilan OpenRouter di 15 detik (lihat
// openRouterClient.ts), dan pertanyaan yang menyertakan asal/tujuan masih
// memanggil mesin routing dulu — jawaban terukur 3–16 detik. 20 detik memberi
// ruang di atas itu tanpa membiarkan layar menggantung tanpa batas.
const ASSISTANT_TIMEOUT_MS = 20_000;

export class AssistantAskError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AssistantAskError";
  }
}

/**
 * Satu pertanyaan, satu jawaban — backend sendiri stateless (tidak
 * menyimpan riwayat percakapan), jadi tidak ada state multi-turn untuk
 * diteruskan di sini (sesuai batasan eksplisit task: tidak perlu
 * kompleksitas riwayat).
 *
 * @param question - pertanyaan wayfinding user, tidak boleh kosong.
 */
export async function askAssistant(question: string): Promise<string> {
  let res: Response;
  try {
    res = await fetchWithTimeout(`${API_BASE_URL}/assistant/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      timeoutMs: ASSISTANT_TIMEOUT_MS,
      timeoutMessage:
        "Asisten tidak menjawab dalam 20 detik. Coba tanya lagi dengan kalimat yang lebih singkat.",
    });
  } catch (err) {
    if (err instanceof RequestTimeoutError) throw new AssistantAskError(err.message, err);
    throw new AssistantAskError(
      `Tidak bisa menghubungi backend di ${API_BASE_URL}. Pastikan server backend jalan.`,
      err,
    );
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch (err) {
    throw new AssistantAskError("Response backend bukan JSON yang valid.", err);
  }

  if (!res.ok) {
    // Backend selalu mengisi `message` yang jelas untuk tiap status error
    // (400 invalid_request, 502 assistant_unavailable, 500 internal_error)
    // — diteruskan apa adanya, bukan pesan generik, supaya user tahu persis
    // kenapa (mis. "Layanan asisten sedang tidak tersedia. Coba lagi
    // sebentar lagi." untuk 502, bukan cuma "gagal").
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as { message?: unknown }).message)
        : `Backend mengembalikan status ${res.status}.`;
    throw new AssistantAskError(message);
  }

  const answer = (body as { answer?: unknown })?.answer;
  if (typeof answer !== "string") {
    throw new AssistantAskError("Response backend tidak berisi jawaban yang valid.");
  }
  return answer;
}
