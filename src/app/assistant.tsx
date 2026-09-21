// src/app/assistant.tsx
//
// Task App-22 + perluasan diminta user langsung (2026-09-10): UI Asisten AI
// (wayfinding chat). Riwayat percakapan sekarang disimpan HANYA dalam satu
// sesi layar ini — array di useState biasa, BUKAN AsyncStorage/persisten.
// Begitu layar ini di-unmount (navigasi keluar, app ditutup/reload), riwayat
// hilang dan mulai bersih lagi kalau dibuka ulang — persis yang diminta
// ("riwayat tersimpan hanya dalam satu sesi, kalau sesi dibatalkan mulai
// baru lagi"). Backend /assistant/ask TETAP stateless (tidak tahu apa-apa
// soal riwayat ini) — riwayat ini murni transkrip tampilan di frontend,
// tiap pertanyaan tetap dikirim sendiri-sendiri tanpa konteks percakapan
// sebelumnya (backend tidak diubah sama sekali, sesuai batasan asli App-22).
import AssistantAnswerText from "@/components/assistant/AssistantAnswerText";
import Text from "@/components/Text";
import { AssistantAskError, askAssistant } from "@/services/assistantService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

const EXAMPLE_QUESTIONS = [
  "Dari Blok M ke Kota naik apa?",
  "Berapa tarif TransJakarta?",
];

type ChatEntry =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; status: "loading" }
  | { id: string; role: "assistant"; status: "success"; answer: string; forQuestion: string }
  | { id: string; role: "assistant"; status: "error"; message: string; forQuestion: string };

let nextId = 0;
function generateId(): string {
  nextId += 1;
  return `entry-${nextId}`;
}

// Sama persis logic yang sudah ada sebelumnya (perluasan App-22, shortcut ke
// hasil rute) — dipindah ke sini apa adanya, cuma sekarang dicocokkan ke
// pertanyaan MASING-MASING entri riwayat, bukan satu state tunggal global.
interface RouteQuery {
  originText: string;
  destinationText: string;
}

function extractRouteQuery(question: string): RouteQuery | null {
  const match = /dari\s+(.+?)\s+ke\s+(.+)/i.exec(question.trim());
  if (!match) return null;

  const originText = match[1].trim();
  const destinationText = match[2]
    .trim()
    .replace(
      /\s*(naik apa|pakai apa|gimana(?:\s+caranya)?|bagaimana(?:\s+caranya)?)\b.*$/i,
      "",
    )
    .replace(/[?.!]+\s*$/, "")
    .trim();

  if (!originText || !destinationText) return null;
  return { originText, destinationText };
}

function AiAvatar() {
  return (
    <View className="w-7 h-7 rounded-full bg-primary-emerald/20 items-center justify-center">
      <Ionicons name="sparkles" size={14} color="#00875A" />
    </View>
  );
}

export default function AssistantScreen() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const isBusy = entries.some(
    (e) => e.role === "assistant" && e.status === "loading",
  );

  const runQuestion = async (question: string, assistantId: string) => {
    try {
      const answer = await askAssistant(question);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === assistantId
            ? { id: assistantId, role: "assistant", status: "success", answer, forQuestion: question }
            : e,
        ),
      );
    } catch (err) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === assistantId
            ? {
                id: assistantId,
                role: "assistant",
                status: "error",
                forQuestion: question,
                message:
                  err instanceof AssistantAskError || err instanceof Error
                    ? err.message
                    : "Gagal mendapat jawaban dari asisten.",
              }
            : e,
        ),
      );
    }
  };

  const handleAsk = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isBusy) return;
    const userId = generateId();
    const assistantId = generateId();
    setEntries((prev) => [
      ...prev,
      { id: userId, role: "user", text: trimmed },
      { id: assistantId, role: "assistant", status: "loading" },
    ]);
    runQuestion(trimmed, assistantId);
  };

  // Kirim ulang PERTANYAAN YANG SAMA ke bubble jawaban yang sama (bukan
  // nambah pasangan tanya-jawab baru) — konsisten dengan pola "retry pesan
  // gagal" di chat app pada umumnya, tidak menduplikasi bubble pertanyaan.
  const handleRetry = (assistantId: string, question: string) => {
    if (isBusy) return;
    setEntries((prev) =>
      prev.map((e) =>
        e.id === assistantId ? { id: assistantId, role: "assistant", status: "loading" } : e,
      ),
    );
    runQuestion(question, assistantId);
  };

  const handleSubmit = () => {
    handleAsk(input);
    setInput("");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#18181B]"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-row items-center gap-3 px-5 pt-14 pb-3">
        <Pressable
          onPress={() => router.back()}
          className="bg-dark-2 p-3 rounded-full"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-light-1 font-bold text-lg">Asisten AI</Text>
          <Text className="text-light-3 text-xs">
            Tanya seputar rute & tarif TransJakarta
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="px-5 pb-6 gap-3"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {entries.length === 0 && (
          <View className="items-center gap-3 py-10 px-4">
            <Ionicons name="chatbubble-ellipses-outline" size={40} color="#71717A" />
            <Text className="text-light-1 text-center font-bold">
              Tanya apa saja soal rute TransJakarta
            </Text>
            <Text className="text-light-3 text-sm text-center">
              Jawaban berdasarkan data GTFS asli — kalau datanya tidak ada,
              asisten akan bilang jujur, bukan mengarang.
            </Text>
          </View>
        )}

        {entries.map((entry) => {
          if (entry.role === "user") {
            return (
              <View
                key={entry.id}
                className="bg-primary-emerald/25 rounded-2xl rounded-br-md px-4 py-2.5 self-end max-w-[85%]"
              >
                <Text className="text-light-1 text-sm font-semibold">{entry.text}</Text>
              </View>
            );
          }

          // Bubble asisten selalu didampingi avatar kecil di kiri — ciri
          // khas tampilan chat app (WhatsApp/Telegram-style), diminta user
          // langsung sebagai perluasan dari tampilan awal App-22.
          if (entry.status === "loading") {
            return (
              <View key={entry.id} className="flex-row items-end gap-2 self-start max-w-[85%]">
                <AiAvatar />
                <View className="flex-row items-center gap-2 bg-dark-2 rounded-2xl rounded-bl-md px-4 py-3.5">
                  <ActivityIndicator size="small" color="#00875A" />
                  <Text className="text-light-3 text-sm">Asisten sedang menjawab...</Text>
                </View>
              </View>
            );
          }

          if (entry.status === "error") {
            return (
              <View key={entry.id} className="flex-row items-end gap-2 self-start max-w-[85%]">
                <AiAvatar />
                <View className="bg-dark-2 border border-red-500/30 rounded-2xl rounded-bl-md px-4 py-3.5 gap-2 flex-1">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="warning-outline" size={16} color="#EF4444" />
                    <Text className="text-red-400 text-sm font-bold flex-1">
                      {entry.message}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRetry(entry.id, entry.forQuestion)}
                    disabled={isBusy}
                    className="bg-dark-4 self-start px-3 py-1.5 rounded-lg"
                    style={{ opacity: isBusy ? 0.5 : 1 }}
                  >
                    <Text className="text-light-1 text-xs font-bold">Coba Lagi</Text>
                  </Pressable>
                </View>
              </View>
            );
          }

          const routeQuery = extractRouteQuery(entry.forQuestion);
          return (
            <View key={entry.id} className="flex-row items-end gap-2 self-start max-w-[90%]">
              <AiAvatar />
              <View className="bg-dark-2 rounded-2xl rounded-bl-md px-4 py-3.5 gap-3 flex-1">
                <AssistantAnswerText text={entry.answer} />
                {routeQuery && (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/route",
                        params: {
                          origin: routeQuery.originText,
                          destination: routeQuery.destinationText,
                        },
                      })
                    }
                    className="flex-row items-center justify-center gap-2 bg-[#00875A] py-2.5 rounded-xl active:opacity-80"
                  >
                    <Ionicons name="navigate" size={16} color="#FFFFFF" />
                    <Text className="text-light-1 font-bold text-sm">
                      Lihat Hasil Rute & Navigasi
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}

        {entries.length === 0 && (
          <View className="gap-2">
            <Text className="text-light-3 text-xs">Contoh pertanyaan:</Text>
            <View className="flex-row flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <Pressable
                  key={q}
                  onPress={() => handleAsk(q)}
                  className="bg-dark-2 border border-light-3/15 px-3 py-2 rounded-full"
                >
                  <Text className="text-light-2 text-xs">{q}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Perluasan diminta user langsung: kotak ketik didesain ulang jadi
          satu pill menyatu (input + tombol kirim dalam satu wadah), gaya
          yang lebih umum dipakai chat app (WhatsApp/iMessage-style) —
          sebelumnya dua elemen terpisah bersebelahan. */}
      <View className="px-5 pb-8 pt-2">
        <View className="flex-row items-end gap-1.5 bg-dark-2 rounded-3xl pl-4 pr-1.5 py-1.5 border border-light-3/10">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Tulis pertanyaan wayfinding..."
            placeholderTextColor="#71717A"
            multiline
            className="flex-1 text-light-1 text-sm py-2 max-h-24"
            // Web (react-native-web) menampilkan outline fokus default
            // browser berbentuk kotak siku yang menimpa bentuk pill bulat
            // dari container-nya — dimatikan khusus di web, tidak
            // berpengaruh di native (iOS/Android tidak kenal properti ini).
            style={Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : undefined}
            editable={!isBusy}
            onSubmitEditing={handleSubmit}
            // Di web, TextInput multiline tidak memicu onSubmitEditing saat
            // Enter ditekan (Enter cuma menyisipkan baris baru). Tangani
            // manual: Enter saja -> kirim pesan, Shift+Enter -> baris baru
            // (perilaku standar chat app desktop).
            onKeyPress={(e) => {
              if (Platform.OS !== "web") return;
              const nativeEvent = e.nativeEvent as unknown as {
                key?: string;
                shiftKey?: boolean;
              };
              if (nativeEvent.key === "Enter" && !nativeEvent.shiftKey) {
                (e as unknown as { preventDefault?: () => void }).preventDefault?.();
                handleSubmit();
              }
            }}
          />
          <Pressable
            onPress={handleSubmit}
            disabled={isBusy || input.trim().length === 0}
            accessibilityLabel="Kirim pertanyaan"
            className="bg-[#00875A] w-10 h-10 rounded-full items-center justify-center active:opacity-80"
            style={{ opacity: isBusy || input.trim().length === 0 ? 0.5 : 1 }}
          >
            {isBusy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
