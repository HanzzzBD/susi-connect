// src/app/nearby-stops.tsx
//
// Task App-15: layar "Halte Terdekat" — daftar halte/stasiun 4 moda
// (TransJakarta, JakLingko, MRT, LRT) terdekat dari lokasi GPS user, dari
// GET /nearby-stops (Task Backend-11). Fitur informasi BERDIRI SENDIRI,
// bukan bagian dari alur cari-rute (batasan eksplisit task) — layar ini
// tidak menyentuh route.tsx/navigate.tsx/routeService.ts sama sekali, dan
// tidak bisa dipakai untuk memulai pencarian rute.
import Text from "@/components/Text";
import {
  MODE_COLOR,
  MODE_ICON,
  MODE_LABEL,
  TransitMode,
  formatDistance,
} from "@/components/transit/transitMode";
import {
  NearbyStop,
  NearbyStopsFetchError,
  fetchNearbyStops,
} from "@/services/nearbyStopsService";
import { Coordinate } from "@/utils/geocode";
import { getCurrentCoordinate } from "@/utils/currentLocation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";

// Radius awal (samakan dengan default backend, lihat services/nearbyStops.ts
// DEFAULT_RADIUS_M) dan tangga perluasan kalau hasil kosong — dibatasi ke
// MAX_RADIUS_M backend (routes/nearbyStops.ts), tidak ada gunanya minta
// lebih dari itu karena backend akan meng-cap-nya sendiri.
const INITIAL_RADIUS_M = 1500;
const EXPANDED_RADIUS_M = 5000;

// __DEV__-only: fitur ini murni GPS-real (batasan eksplisit task — tidak ada
// data fiktif dikirim ke UI), jadi kalau device betulan berada di luar
// Jakarta, hasil normalnya memang kosong — itu bukan bug. Tapi untuk QA saat
// tester tidak sedang di Jakarta, sediakan simulasi lokasi TANPA mengubah
// setting GPS device (mock-location app, dsb). Titik-titik ini persis sama
// yang sudah live-diverifikasi lewat curl langsung ke backend di Task
// Backend-11 (Bundaran HI: 30 halte, mrt:1/jaklingko:17/transjakarta:12;
// Manggarai: termasuk LRT Proklamasi @731m) — dipilih supaya hasil simulasi
// bisa langsung dicocokkan ke angka yang sudah diketahui benar.
// __DEV__ true di Expo dev client, false di build production — blok ini
// (dan tombolnya) tidak pernah ikut ke build yang dirilis.
const DEV_TEST_LOCATIONS: { label: string; coordinate: Coordinate }[] = [
  { label: "Bundaran HI (uji)", coordinate: { latitude: -6.1918644, longitude: 106.8230084 } },
  { label: "Manggarai (uji)", coordinate: { latitude: -6.2086283, longitude: 106.8456205 } },
];

type LoadState =
  | { status: "loading" }
  | { status: "permission_denied" }
  | { status: "error"; message: string }
  | { status: "success"; stops: NearbyStop[]; radiusM: number };

function ScreenHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-3 px-5 pt-14 pb-2">
      <Pressable
        onPress={() => router.back()}
        className="bg-dark-2 p-3 rounded-full"
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </Pressable>
      <Text className="text-light-1 font-bold text-lg flex-1">{title}</Text>
      {/* Perluasan App-15 (diminta user langsung): pintasan ke peta SEMUA
          halte se-Jakarta — beda fitur dari list "terdekat dari saya" di
          layar ini (lihat all-stops-map.tsx), sengaja bukan navigasi rute. */}
      <Pressable
        onPress={() => router.push("/all-stops-map")}
        className="bg-dark-2 flex-row items-center gap-1.5 px-3.5 py-3 rounded-full"
      >
        <Ionicons name="map-outline" size={16} color="#FFFFFF" />
        <Text className="text-light-1 font-bold text-xs">Peta</Text>
      </Pressable>
    </View>
  );
}

function ModeBadge({ mode }: { mode: TransitMode }) {
  return (
    <View
      className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ backgroundColor: `${MODE_COLOR[mode]}26` }}
    >
      <Ionicons name={MODE_ICON[mode]} size={13} color={MODE_COLOR[mode]} />
      <Text
        className="text-xs font-bold"
        style={{ color: MODE_COLOR[mode] }}
      >
        {MODE_LABEL[mode]}
      </Text>
    </View>
  );
}

function StopRow({ stop }: { stop: NearbyStop }) {
  return (
    <View className="flex-row items-center gap-3 bg-dark-2 rounded-2xl p-4 border border-light-3/10">
      <View
        className="p-2.5 rounded-xl"
        style={{ backgroundColor: `${MODE_COLOR[stop.mode]}26` }}
      >
        <Ionicons name={MODE_ICON[stop.mode]} size={20} color={MODE_COLOR[stop.mode]} />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-light-1 font-bold text-md" numberOfLines={2}>
          {stop.name}
        </Text>
        <ModeBadge mode={stop.mode} />
      </View>
      <Text className="text-light-1 font-bold text-sm">
        {formatDistance(stop.distance_m)}
      </Text>
    </View>
  );
}

export default function NearbyStopsScreen() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  // Koordinat terakhir yang benar-benar dipakai (GPS asli ATAU lokasi uji
  // __DEV__) — disimpan supaya "Perluas Radius" dan "Coba Lagi" pakai ulang
  // titik yang sama, bukan diam-diam kembali minta GPS asli (yang bisa beda
  // kalau tester sedang pakai lokasi uji karena berada di luar Jakarta).
  const lastCoordinateRef = useRef<Coordinate | null>(null);

  const loadAt = useCallback(async (coordinate: Coordinate, radiusM: number) => {
    lastCoordinateRef.current = coordinate;
    setState({ status: "loading" });
    try {
      const stops = await fetchNearbyStops(
        coordinate.latitude,
        coordinate.longitude,
        radiusM,
      );
      setState({ status: "success", stops, radiusM });
    } catch (err) {
      setState({
        status: "error",
        message:
          err instanceof NearbyStopsFetchError || err instanceof Error
            ? err.message
            : "Gagal memuat daftar halte terdekat.",
      });
    }
  }, []);

  const loadFromGps = useCallback(
    async (radiusM: number) => {
      setState({ status: "loading" });
      const coordinate = await getCurrentCoordinate();
      if (!coordinate) {
        setState({ status: "permission_denied" });
        return;
      }
      await loadAt(coordinate, radiusM);
    },
    [loadAt],
  );

  // "Muat ulang" generik dipakai tombol Coba Lagi / Perluas Radius: kalau
  // sebelumnya sedang pakai lokasi uji, tetap di lokasi uji itu; kalau
  // belum ada koordinat sama sekali (baru pertama retry dari
  // permission_denied), minta GPS asli lagi.
  const reload = useCallback(
    (radiusM: number) => {
      if (lastCoordinateRef.current) {
        loadAt(lastCoordinateRef.current, radiusM);
      } else {
        loadFromGps(radiusM);
      }
    },
    [loadAt, loadFromGps],
  );

  useEffect(() => {
    loadFromGps(INITIAL_RADIUS_M);
  }, [loadFromGps]);

  return (
    <View className="flex-1 bg-[#18181B]">
      <ScreenHeader title="Halte Terdekat" />

      {/* __DEV__-only: lihat komentar DEV_TEST_LOCATIONS di atas — tidak
          pernah tampil di build production. */}
      {__DEV__ && (
        <View className="flex-row flex-wrap gap-2 px-5 pb-3">
          {DEV_TEST_LOCATIONS.map((loc) => (
            <Pressable
              key={loc.label}
              onPress={() => loadAt(loc.coordinate, INITIAL_RADIUS_M)}
              className="bg-yellow-500/20 border border-yellow-500/40 px-3 py-1.5 rounded-full"
            >
              <Text className="text-yellow-500 text-xs font-bold">
                🧪 {loc.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {state.status === "loading" ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#00875A" />
          <Text className="text-light-2 text-sm">Mencari lokasi & halte terdekat...</Text>
        </View>
      ) : state.status === "permission_denied" ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="location-outline" size={40} color="#71717A" />
          <Text className="text-light-1 text-center font-bold">
            Izin lokasi dibutuhkan
          </Text>
          <Text className="text-light-3 text-center text-sm">
            Aktifkan izin lokasi untuk melihat halte terdekat dari posisimu
            saat ini.
          </Text>
          <Pressable
            onPress={() => reload(INITIAL_RADIUS_M)}
            className="bg-light-1 px-5 py-2.5 rounded-xl mt-2"
          >
            <Text className="text-dark-1 font-bold">Coba Lagi</Text>
          </Pressable>
        </View>
      ) : state.status === "error" ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="warning-outline" size={40} color="#EF4444" />
          <Text className="text-light-1 text-center font-bold">
            {state.message}
          </Text>
          <Pressable
            onPress={() => reload(INITIAL_RADIUS_M)}
            className="bg-light-1 px-5 py-2.5 rounded-xl mt-2"
          >
            <Text className="text-dark-1 font-bold">Coba Lagi</Text>
          </Pressable>
        </View>
      ) : state.stops.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Ionicons name="navigate-outline" size={40} color="#71717A" />
          <Text className="text-light-1 text-center font-bold">
            Tidak ada halte dalam {formatDistance(state.radiusM)}
          </Text>
          {state.radiusM < EXPANDED_RADIUS_M && (
            <Pressable
              onPress={() => reload(EXPANDED_RADIUS_M)}
              className="bg-light-1 px-5 py-2.5 rounded-xl mt-2"
            >
              <Text className="text-dark-1 font-bold">
                Perluas Radius ke {formatDistance(EXPANDED_RADIUS_M)}
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={state.stops}
          keyExtractor={(item, index) => `${item.mode}-${item.name}-${index}`}
          renderItem={({ item }) => <StopRow stop={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerClassName="px-5 pb-10 pt-2"
          ListHeaderComponent={
            <Text className="text-light-3 text-sm mb-3">
              {state.stops.length} halte dalam radius {formatDistance(state.radiusM)}
            </Text>
          }
        />
      )}
    </View>
  );
}
