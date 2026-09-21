// src/app/all-stops-map.tsx
//
// Perluasan dari Task App-15 (diminta user langsung, bukan dari task file
// tertulis): peta SEMUA halte/stasiun 4 moda se-Jakarta (bisa ribuan titik),
// dari GET /all-stops (backend/backend-skeleton/src/routes/allStops.ts).
// BEDA dari nearby-stops.tsx: layar itu selalu berbasis "terdekat dari GPS
// saya" (maks 30 titik, radius 1.5-5km) — layar ini tidak butuh GPS sama
// sekali, cuma gambaran keseluruhan cakupan transit se-Jakarta. Fitur
// informasi berdiri sendiri juga (sama batasan App-15) — tidak menyentuh
// alur cari-rute.
import Text from "@/components/Text";
import AllStopsMapView from "@/components/transit/AllStopsMapView";
import type { AllStopsMapViewHandle } from "@/components/transit/allStopsMapTypes";
import {
  MODE_COLOR,
  MODE_ICON,
  MODE_LABEL,
  TransitMode,
} from "@/components/transit/transitMode";
import {
  NearbyStopsFetchError,
  TransitStop,
  fetchAllStops,
} from "@/services/nearbyStopsService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

const ALL_MODES: TransitMode[] = ["transjakarta", "jaklingko", "mrt", "lrt"];
const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_RESULTS = 20;

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; stops: TransitStop[] };

function ScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View className="absolute top-14 left-5 right-5 flex-row items-center gap-3 z-10">
      <Pressable
        onPress={() => router.back()}
        className="bg-dark-2 p-3 rounded-full shadow-md"
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </Pressable>
      <View className="bg-dark-2/95 px-4 py-2.5 rounded-full">
        <Text className="text-light-1 font-bold text-sm">{title}</Text>
      </View>
    </View>
  );
}

function ModeToggleChip({
  mode,
  count,
  active,
  onToggle,
}: {
  mode: TransitMode;
  count: number;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-1.5 px-3 py-2 rounded-full"
      style={{
        backgroundColor: active ? `${MODE_COLOR[mode]}33` : "rgba(39, 39, 42, 0.95)",
        borderWidth: 1,
        borderColor: active ? MODE_COLOR[mode] : "rgba(161, 161, 170, 0.3)",
      }}
    >
      <Ionicons
        name={MODE_ICON[mode]}
        size={14}
        color={active ? MODE_COLOR[mode] : "#71717A"}
      />
      <Text
        className="text-xs font-bold"
        style={{ color: active ? MODE_COLOR[mode] : "#71717A" }}
      >
        {MODE_LABEL[mode]} ({count})
      </Text>
    </Pressable>
  );
}

function SearchResultRow({
  stop,
  onPress,
}: {
  stop: TransitStop;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2.5 px-4 py-3 active:bg-dark-4 border-b border-light-3/10 last:border-b-0"
    >
      <Ionicons name={MODE_ICON[stop.mode]} size={16} color={MODE_COLOR[stop.mode]} />
      <View className="flex-1">
        <Text className="text-light-1 font-bold text-sm" numberOfLines={1}>
          {stop.name}
        </Text>
      </View>
      <Text className="text-xs font-bold" style={{ color: MODE_COLOR[stop.mode] }}>
        {MODE_LABEL[stop.mode]}
      </Text>
    </Pressable>
  );
}

export default function AllStopsMapScreen() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  // Default: JakLingko dimatikan — 7215 dari 7829 titik total (lihat
  // Task Backend-09/App-15), langsung tampil semua sejak awal bikin peta
  // penuh sesak dan susah dibaca 3 moda lain yang jauh lebih jarang. User
  // tinggal tap chip JakLingko kalau memang mau lihat cakupannya.
  const [activeModes, setActiveModes] = useState<Set<TransitMode>>(
    () => new Set(ALL_MODES.filter((m) => m !== "jaklingko")),
  );

  const mapRef = useRef<AllStopsMapViewHandle>(null);
  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [chipsHeight, setChipsHeight] = useState(0);
  // Sama alasan dengan blurTimeoutRef di LocationAutocompleteField.tsx: tap
  // di baris hasil menyentuh layar sebelum TextInput sempat blur, jadi blur
  // ditunda dikit supaya onPress sempat kebaca duluan.
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const stops = await fetchAllStops();
      setState({ status: "success", stops });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof NearbyStopsFetchError || err instanceof Error
            ? err.message
            : "Gagal memuat data halte.",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const countByMode = useMemo(() => {
    const counts: Record<TransitMode, number> = {
      transjakarta: 0,
      jaklingko: 0,
      mrt: 0,
      lrt: 0,
    };
    if (state.status === "success") {
      for (const stop of state.stops) counts[stop.mode]++;
    }
    return counts;
  }, [state]);

  const filteredStops = useMemo(() => {
    if (state.status !== "success") return [];
    return state.stops.filter((s) => activeModes.has(s.mode));
  }, [state, activeModes]);

  const toggleMode = (mode: TransitMode) => {
    setActiveModes((current) => {
      const next = new Set(current);
      if (next.has(mode)) next.delete(mode);
      else next.add(mode);
      return next;
    });
  };

  // Cari lintas SEMUA moda (state.stops, bukan filteredStops) — user harus
  // tetap bisa menemukan halte JakLingko lewat cari walau chip-nya lagi
  // mati; handleSelectResult di bawah yang menyalakan moda itu otomatis
  // begitu dipilih, supaya hasilnya benar-benar kelihatan di peta.
  const trimmedQuery = searchQuery.trim();
  const searchResults = useMemo(() => {
    if (state.status !== "success" || trimmedQuery.length < MIN_SEARCH_LENGTH) return [];
    const needle = trimmedQuery.toLowerCase();
    return state.stops
      .filter((s) => s.name.toLowerCase().includes(needle))
      .slice(0, MAX_SEARCH_RESULTS);
  }, [state, trimmedQuery]);

  const clearBlurTimeout = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  // BUG (ditemukan dari laporan user — "halte tidak langsung muncul" setelah
  // cari): handleSelectResult LAMA memanggil mapRef.flyTo() di baris yang
  // sama dengan setActiveModes(...). setState di React tidak langsung
  // mengubah props — AllStopsMapView masih menerima `stops` versi LAMA
  // (belum termasuk moda yang baru dinyalakan) di saat kamera sudah mulai
  // terbang ke sana, jadi kamera sampai duluan sebelum titik targetnya ada
  // di peta. Diperbaiki dengan menyimpan target di state, dan baru
  // memanggil flyTo lewat useEffect SETELAH activeModes benar-benar berisi
  // moda itu (yang berarti filteredStops/geojson di AllStopsMapView sudah
  // ikut re-render dengan titik yang dicari).
  const [pendingFlyTarget, setPendingFlyTarget] = useState<{
    lat: number;
    lng: number;
    mode: TransitMode;
  } | null>(null);

  useEffect(() => {
    if (!pendingFlyTarget) return;
    if (!activeModes.has(pendingFlyTarget.mode)) return;
    mapRef.current?.flyTo({ lat: pendingFlyTarget.lat, lng: pendingFlyTarget.lng }, 17);
    setPendingFlyTarget(null);
  }, [pendingFlyTarget, activeModes]);

  const handleSelectResult = (stop: TransitStop) => {
    clearBlurTimeout();
    setIsSearchFocused(false);
    // BUG (dilaporkan user: "search kedua kali tidak muncul rekomendasi"):
    // di native, tap baris hasil TIDAK mem-blur TextInput-nya — keyboard
    // tetap terbuka dan input tetap fokus secara native, padahal state
    // isSearchFocused sudah di-set false di baris atas. Akibatnya saat user
    // mengetik lagi, TIDAK ada transisi blur->focus, jadi onFocus tidak
    // pernah jalan lagi, isSearchFocused tetap false selamanya, dan
    // dropdown tidak pernah muncul lagi sampai layar dibuka ulang.
    // blur() eksplisit di sini menyamakan state native dengan state React.
    // (onChangeText di bawah juga ikut menyalakan isSearchFocused sebagai
    // pengaman kedua — mengetik jelas berarti user sedang pakai field ini,
    // terlepas dari event fokus mana yang sempat/tidak sempat jalan.)
    searchInputRef.current?.blur();
    setSearchQuery(stop.name);
    // Pastikan moda halte yang dipilih memang aktif — kalau user cari
    // sesuatu dari moda yang chip-nya lagi mati (mis. JakLingko), hasil
    // tap tidak ada gunanya kalau titiknya tetap tersembunyi di peta.
    setActiveModes((current) => {
      if (current.has(stop.mode)) return current;
      const next = new Set(current);
      next.add(stop.mode);
      return next;
    });
    setPendingFlyTarget({ lat: stop.lat, lng: stop.lng, mode: stop.mode });
  };

  const showSearchDropdown = isSearchFocused && trimmedQuery.length >= MIN_SEARCH_LENGTH;

  return (
    <View className="flex-1 bg-[#18181B]">
      <ScreenHeader title="Peta Semua Halte" />

      {state.status === "loading" ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#00875A" />
          <Text className="text-light-2 text-sm">Memuat data halte se-Jakarta...</Text>
        </View>
      ) : state.status === "error" ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="warning-outline" size={40} color="#EF4444" />
          <Text className="text-light-1 text-center font-bold">
            {state.message}
          </Text>
          <Pressable
            onPress={load}
            className="bg-light-1 px-5 py-2.5 rounded-xl mt-2"
          >
            <Text className="text-dark-1 font-bold">Coba Lagi</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <AllStopsMapView
            ref={mapRef}
            stops={filteredStops}
            bottomInset={chipsHeight}
          />

          <View className="absolute top-28 left-5 right-5 z-10">
            <View className="flex-row items-center gap-2 bg-dark-2/95 px-4 py-3 rounded-full">
              <Ionicons name="search" size={16} color="#71717A" />
              <TextInput
                ref={searchInputRef}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  // Pengaman kedua untuk bug "search kedua kali" — lihat
                  // catatan di handleSelectResult.
                  clearBlurTimeout();
                  setIsSearchFocused(true);
                }}
                onFocus={() => {
                  clearBlurTimeout();
                  setIsSearchFocused(true);
                }}
                onBlur={() => {
                  blurTimeoutRef.current = setTimeout(() => setIsSearchFocused(false), 150);
                }}
                placeholder="Cari nama halte..."
                placeholderTextColor="#71717A"
                className="flex-1 text-light-1 font-bold text-sm"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => {
                    setSearchQuery("");
                    // Fokus balik ke field supaya user bisa langsung ketik
                    // ulang tanpa tap dua kali — pola sama dengan tombol X
                    // di LocationAutocompleteField (Task App-09).
                    searchInputRef.current?.focus();
                  }}
                  hitSlop={8}
                  accessibilityLabel="Hapus pencarian"
                >
                  <Ionicons name="close-circle" size={18} color="#71717A" />
                </Pressable>
              )}
            </View>

            {showSearchDropdown && (
              <View className="mt-2 bg-dark-2 border border-light-3/15 rounded-xl overflow-hidden max-h-80">
                {searchResults.length === 0 ? (
                  <View className="px-4 py-3">
                    <Text className="text-light-3 text-sm">
                      Tidak ada halte bernama &quot;{trimmedQuery}&quot;
                    </Text>
                  </View>
                ) : (
                  // Bug dilaporkan user: hasil (bisa sampai 20 baris) tidak
                  // bisa di-scroll — View biasa + overflow-hidden cuma
                  // MEMOTONG konten yang lebih tinggi dari max-h-80, tidak
                  // pernah bikin bisa digulir. ScrollView-nya butuh
                  // keyboardShouldPersistTaps="handled": dropdown ini selalu
                  // tampil SAAT keyboard terbuka (search sedang fokus), jadi
                  // tanpa itu tap ke salah satu baris akan "dimakan" gestur
                  // tutup-keyboard duluan sebelum onPress sempat jalan — bug
                  // yang sama persis dengan yang diperbaiki di Beranda
                  // (Task App-09).
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
                    {searchResults.map((stop, index) => (
                      <SearchResultRow
                        key={`${stop.mode}-${stop.name}-${index}`}
                        stop={stop}
                        onPress={() => handleSelectResult(stop)}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          <View
            className="absolute bottom-8 left-5 right-5 z-10 flex-row flex-wrap gap-2 justify-center"
            // Tingginya berubah tergantung lebar layar (4 chip bisa jadi 1
            // atau 2 baris) — diukur, bukan ditebak, lalu dipakai peta
            // untuk menaruh kartu info halte tepat di atas baris ini.
            onLayout={(e) => setChipsHeight(e.nativeEvent.layout.height)}
          >
            {ALL_MODES.map((mode) => (
              <ModeToggleChip
                key={mode}
                mode={mode}
                count={countByMode[mode]}
                active={activeModes.has(mode)}
                onToggle={() => toggleMode(mode)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}
