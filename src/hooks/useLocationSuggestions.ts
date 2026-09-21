// src/hooks/useLocationSuggestions.ts
//
// Task App-06: debounce + abort untuk autocomplete lokasi. Dipisah jadi
// hook (bukan ditulis langsung di komponen field) karena dipakai dua kali
// persis sama (field "Dari" dan "Tujuan") — satu implementasi, bukan dua
// yang bisa diam-diam berbeda.
import { PlaceSuggestion, searchPlaceSuggestions } from "@/utils/geocode";
import { useEffect, useRef, useState } from "react";

// Di tengah rentang 500-800ms yang diminta task.
const DEBOUNCE_MS = 600;

interface UseLocationSuggestionsResult {
  suggestions: PlaceSuggestion[];
  isLoading: boolean;
}

/**
 * @param query - teks yang sedang diketik user.
 * @param enabled - hanya cari kalau true (field lagi fokus). Tanpa ini,
 *   perubahan `query` yang datang dari luar — auto-isi GPS (App-05), atau
 *   field lain yang baru saja di-set dari tap saran — ikut memicu
 *   pencarian yang tidak diminta siapa pun.
 */
export function useLocationSuggestions(
  query: string,
  enabled: boolean,
): UseLocationSuggestionsResult {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Ketukan baru (atau field kehilangan fokus) -> request lama, kalau
    // masih di tengah jalan, resmi usang. Di-abort supaya hasilnya yang
    // "telat" tidak pernah sampai menimpa suggestions yang lebih baru
    // (acceptance criteria: ganti kata kunci cepat tidak menampilkan hasil
    // basi).
    abortControllerRef.current?.abort();

    if (!enabled || query.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(() => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      searchPlaceSuggestions(query, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setIsLoading(false);
        })
        .catch((error) => {
          // Ditemukan lewat testing device fisik (dev client, Task App-12):
          // di React Native native (Hermes), fetch yang di-abort TIDAK
          // selalu melempar error dengan .name === "AbortError" seperti
          // spec Fetch web — pesannya bisa "fetch failed: Fetch request
          // has been canceled" dengan .name lain sama sekali, tembus ke
          // console.error dan muncul sebagai LogBox merah walau perilakunya
          // sebenarnya benar (abort yang disengaja). controller.signal.
          // aborted adalah fakta langsung soal APAKAH INI aborted oleh kita
          // sendiri — tidak bergantung tebak-tebak bentuk error yang
          // berbeda-beda antar platform/fetch implementation.
          if (controller.signal.aborted) return;
          console.error("Gagal mengambil saran lokasi:", error);
          setSuggestions([]);
          setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, enabled]);

  // Request yang masih menggantung saat komponen unmount (pindah layar
  // sebelum hasil datang) juga harus di-abort, bukan cuma saat ganti query.
  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  return { suggestions, isLoading };
}
