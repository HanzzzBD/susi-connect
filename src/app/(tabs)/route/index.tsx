// src/app/(tabs)/route/index.tsx
//
// Task App-12: dipindah dari (tabs)/route.tsx (isi tidak berubah) — supaya
// jadi root screen di dalam Stack milik route/_layout.tsx, bukan flat
// sibling dengan route/[id].tsx di dalam Tabs navigator. Lihat komentar di
// route/_layout.tsx untuk alasan lengkapnya.
import Text from "@/components/Text";
import {
  adaptToLegacyShape,
  fetchRealRoutes,
  RouteFetchError,
} from "@/services/routeService";
import { ApiResponse, RouteItem } from "@/type";
import { formatRupiah } from "@/utils/currency";
import { formatDepartureLabel } from "@/utils/departureTime";
import { geocodePlace } from "@/utils/geocode";
import { Ionicons } from "@expo/vector-icons";
import { legModeStyle, MODE_FILTERS } from "@/components/transit/legModes";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from "react-native";

// Helper untuk menentukan label tipe berdasarkan karakteristik rute.
// recommendation_score/crowd bisa undefined (backend belum mengisinya —
// lihat TEMPORARY SHIM di src/services/routeService.ts), jadi jangan
// diakses langsung.
const getRouteTypeLabel = (item: RouteItem): string => {
  if ((item.recommendation_score ?? 0) >= 0.9) return "Rekomendasi";
  if (item.travel_time_minutes <= 30) return "Cepat";
  if (item.cost_idr <= 4000) return "Murah";
  if (item.crowd?.predicted_level === "LOW") return "Tenang";
  return "Nyaman";
};

const getModeIcon = (mode: string) => {
  const style = legModeStyle(mode);
  return <Ionicons name={style.icon} size={18} color={style.color} />;
};

const RouteOptionCard = ({
  item,
  originName,
}: {
  item: RouteItem;
  originName: string;
}) => {
  const router = useRouter();
  const typeLabel = getRouteTypeLabel(item);

  // Skor rekomendasi belum tentu ada (lihat komentar di atas) — kalau
  // undefined, jangan tampilkan angka/warna dari data yang tidak ada.
  const score10 =
    item.recommendation_score != null
      ? Math.round(item.recommendation_score * 10)
      : null;
  const scoreColor =
    score10 == null
      ? "text-light-3"
      : score10 >= 8
        ? "text-primary-emerald"
        : score10 >= 6
          ? "text-yellow-400"
          : "text-accent";

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/route/[id]",
          params: {
            data: JSON.stringify(item),
            origin: originName,
          },
        })
      }
      className="bg-dark-2 px-4 py-4 gap-3 rounded-xl active:opacity-95 border border-light-3/5"
    >
      <View className="flex-row justify-between items-center">
        <Text className="bg-light-1/10 font-bold text-light-1 text-xs px-2.5 py-1 rounded-md capitalize border border-light-1/10">
          {typeLabel}
        </Text>
        {item.crowd?.predicted_level === "HIGH" && (
          <View className="flex-row items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded">
            <Ionicons name="people" size={12} color="#EF4444" />
            <Text className="text-red-400 text-[10px] font-bold">PADAT</Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-1.5 items-center flex-1">
          {item.legs.map((leg, index) => {
            const isLast = index === item.legs.length - 1;
            return (
              <View key={index} className="flex-row items-center gap-1">
                {getModeIcon(leg.mode)}
                {!isLast && (
                  <Ionicons name="chevron-forward" size={14} color="#52525B" />
                )}
              </View>
            );
          })}
        </View>
        {score10 != null ? (
          <Text className={`font-bold text-xl ${scoreColor}`}>
            {score10}
            <Text className="text-sm text-light-3">/10</Text>
          </Text>
        ) : (
          <Text className="text-xs text-light-3">Skor belum tersedia</Text>
        )}
      </View>

      <View className="flex-row justify-between items-center pt-1 border-t border-light-3/10">
        <View className="flex-row gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#A1A1AA" />
            <Text className="text-xs text-light-2">
              {item.travel_time_minutes} mnt
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="swap-horizontal" size={14} color="#A1A1AA" />
            <Text className="text-xs text-light-2">
              {item.transfers}x transit
            </Text>
          </View>
        </View>
        <Text className="text-sm font-semibold text-light-1">
          {formatRupiah(item.cost_idr)}
        </Text>
      </View>
    </Pressable>
  );
};

export default function RouteScreen() {
  // Diisi lewat router.push dari layar Beranda (index.tsx) setelah user
  // mengisi asal & tujuan nyata. Tab "Rute" juga bisa dibuka langsung dari
  // tab bar tanpa params ini — ditangani sebagai state kosong di bawah,
  // bukan fallback ke mock.
  const {
    origin: originParam,
    destination: destinationParam,
    // Task App-08: ISO 8601 dengan offset (dibangun di index.tsx lewat
    // buildDepartureTimeIso), atau undefined kalau user tidak mengaktifkan
    // "Atur waktu" — diteruskan apa adanya ke fetchRealRoutes di bawah.
    departureTime: departureTimeParam,
  } = useLocalSearchParams<{
    origin?: string;
    destination?: string;
    departureTime?: string;
  }>();

  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [modeKey, setModeKey] = useState(MODE_FILTERS[0].key);
  const modeFilter = MODE_FILTERS.find((m) => m.key === modeKey) ?? MODE_FILTERS[0];
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filters = ["Semua", "Rekomendasi", "Cepat", "Murah", "Tenang"];

  useEffect(() => {
    if (!originParam || !destinationParam) return;

    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setApiResponse(null);
      try {
        const [originCoord, destCoord] = await Promise.all([
          geocodePlace(originParam),
          geocodePlace(destinationParam),
        ]);
        if (!originCoord || !destCoord) {
          throw new Error(
            `Tidak bisa menemukan koordinat untuk "${
              !originCoord ? originParam : destinationParam
            }". Coba nama tempat yang lebih spesifik.`,
          );
        }

        // fetchRealRoutes + adaptToLegacyShape menggantikan mockApiResponse
        // (Task Integration-01) — lihat src/services/routeService.ts.
        const recommendation = await fetchRealRoutes(
          { lat: originCoord.latitude, lng: originCoord.longitude },
          { lat: destCoord.latitude, lng: destCoord.longitude },
          departureTimeParam,
          modeFilter.backendModes,
        );
        if (cancelled) return;
        setApiResponse(adaptToLegacyShape(recommendation));
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(
          err instanceof RouteFetchError || err instanceof Error
            ? err.message
            : "Gagal memuat rute dari backend.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // modeFilter berubah hanya lewat modeKey — cukup modeKey di daftar ini.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originParam, destinationParam, departureTimeParam, modeKey]);

  const filteredRoutes = (apiResponse?.routes ?? [])
    .filter((item) => {
      if (selectedFilter === "Semua") return true;
      return getRouteTypeLabel(item) === selectedFilter;
    })
    // Backend sudah mengembalikan `routes` terurut dari yang paling
    // relevan berdasarkan recommendation_score-nya sendiri (lihat `rank`
    // di adaptToLegacyShape) — tidak disortir ulang di sini secara
    // terpisah supaya urutannya konsisten dengan yang dihitung backend.
    .slice()
    .sort((a, b) => a.rank - b.rank);

  const headerOrigin = apiResponse?.origin.name ?? originParam;
  const headerDestination = apiResponse?.destination.name ?? destinationParam;
  // Task App-20: waktu berangkat yang BENAR-BENAR dipakai backend untuk
  // hitung jadwal rute ini — sama untuk semua kandidat di bawah, jadi
  // ditampilkan sekali di header, bukan diulang tiap kartu.
  const departureLabel = apiResponse?.departure_time
    ? formatDepartureLabel(apiResponse.departure_time)
    : null;

  return (
    <View className="flex-1 bg-[#18181B]">
      <ScrollView
        contentContainerClassName="px-5 pt-14 pb-28 gap-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text className="text-3xl font-bold text-light-1">Hasil Rute</Text>
          {headerOrigin && headerDestination && (
            <Text className="text-light-2 text-sm">
              {headerOrigin} → {headerDestination}
            </Text>
          )}
          {departureLabel && (
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={13} color="#71717A" />
              <Text className="text-light-3 text-xs">
                Berangkat pukul {departureLabel}
              </Text>
            </View>
          )}
          {originParam && destinationParam && (
            // Di luar percabangan loading/error/kosong di bawah: kalau satu
            // moda tidak menghasilkan rute, chip ini harus tetap bisa ditekan
            // untuk kembali, bukan ikut hilang bersama daftar hasil.
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2 pt-2"
              accessibilityLabel="Filter moda transportasi"
            >
              {MODE_FILTERS.map((m) => {
                const active = m.key === modeKey;
                return (
                  <Pressable
                    key={m.key}
                    onPress={() => setModeKey(m.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Tampilkan rute ${m.label}`}
                    className={`${active ? "bg-light-1" : "bg-dark-4"} flex-row items-center gap-1.5 px-3 py-2 rounded-full border border-light-3/10`}
                  >
                    {m.icon && (
                      <Ionicons name={m.icon} size={14} color={active ? "#18181B" : "#D4D4D8"} />
                    )}
                    {/* Warna lewat style, bukan className: di web, class
                        Text yang berganti ditumpuk (text-dark-1 + text-light-2
                        sekaligus), jadi chip yang aktif lagi bisa berteks
                        pucat di atas latar putih. */}
                    <Text
                      className="font-semibold text-xs"
                      style={{ color: active ? "#18181B" : "#D4D4D8" }}
                    >
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {!originParam || !destinationParam ? (
          <View className="items-center gap-3 py-10 px-4">
            <Ionicons name="search-outline" size={32} color="#71717A" />
            <Text className="text-light-2 text-sm text-center">
              Belum ada pencarian rute. Isi asal & tujuan di halaman Beranda
              dulu.
            </Text>
          </View>
        ) : isLoading ? (
          <View className="items-center gap-3 py-10">
            <ActivityIndicator size="large" color="#00875A" />
            <Text className="text-light-2 text-sm">
              Mencari rute dari backend...
            </Text>
          </View>
        ) : errorMessage ? (
          <View className="items-center gap-3 py-10 px-4">
            <Ionicons name="warning-outline" size={32} color="#EF4444" />
            <Text className="text-light-1 text-sm text-center">
              {errorMessage}
            </Text>
          </View>
        ) : apiResponse && apiResponse.routes.length === 0 ? (
          <View className="items-center gap-3 py-10 px-4">
            <Ionicons name="alert-circle-outline" size={32} color="#71717A" />
            <Text className="text-light-2 text-sm text-center">
              {modeFilter.backendModes
                ? `Tidak ada rute yang hanya memakai ${modeFilter.label} untuk perjalanan ini. Pilih "Semua moda" untuk melihat rute gabungan.`
                : "Tidak ada rute yang ditemukan untuk perjalanan ini."}
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2"
            >
              {filters.map((f) => {
                const active = selectedFilter === f;
                return (
                  // Latar di Pressable, warna teks lewat style — sama seperti
                  // chip moda di atas: class Text yang berganti ditumpuk di
                  // web, membuat teks chip aktif pucat di atas latar putih.
                  <Pressable
                    key={f}
                    onPress={() => setSelectedFilter(f)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    className={`${active ? "bg-light-1" : "bg-dark-4"} px-4 py-2 rounded-full border border-light-3/10`}
                  >
                    <Text
                      className="font-semibold text-xs"
                      style={{ color: active ? "#18181B" : "#D4D4D8" }}
                    >
                      {f}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="gap-3">
              {filteredRoutes.map((item) => (
                <RouteOptionCard
                  key={item.route_id}
                  item={item}
                  originName={apiResponse!.origin.name}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
