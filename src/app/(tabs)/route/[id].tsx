// src/app/route/[id].tsx
import InfoCard from "@/components/InfoCard";
import RouteDetailCard from "@/components/RouteDetailCard";
import Text from "@/components/Text";
import { RouteItem } from "@/type";
import { formatRupiah } from "@/utils/currency";
import { formatDepartureLabel } from "@/utils/departureTime";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

export default function RouteDetailScreen() {
  const { data, origin } = useLocalSearchParams<{
    data: string;
    origin: string;
  }>();
  const routeData: RouteItem = JSON.parse(data);
  const router = useRouter();

  // comfort_score, reliability, dan crowd bisa undefined — backend belum
  // mengisinya (Task Backend-04/05) atau field itu memang tidak ada di
  // skema backend sama sekali. Tangani graceful, jangan tebak angkanya.
  // Lihat TEMPORARY SHIM di src/services/routeService.ts.
  const comfortPercent =
    routeData.comfort_score != null
      ? Math.round(routeData.comfort_score * 100)
      : null;
  const reliabilityPercent =
    routeData.reliability != null
      ? Math.round(routeData.reliability.score * 100)
      : null;
  // Task App-20: waktu berangkat yang BENAR-BENAR dipakai backend untuk
  // hitung jadwal rute ini (lihat catatan RouteItem.departure_time).
  const departureLabel = routeData.departure_time
    ? formatDepartureLabel(routeData.departure_time)
    : null;

  return (
    <View className="flex-1 bg-[#18181B]">
      <ScrollView contentContainerClassName="px-5 pt-14 pb-28 gap-6">
        {/* Header Info */}
        <View className="gap-1">
          <View className="flex-row items-center gap-2">
            {routeData.crowd ? (
              <View
                className={`px-2 py-0.5 rounded ${routeData.crowd.current_level === "HIGH" ? "bg-red-500/20" : routeData.crowd.current_level === "MEDIUM" ? "bg-yellow-500/20" : "bg-green-500/20"}`}
              >
                <Text
                  className={`text-xs font-bold ${routeData.crowd.current_level === "HIGH" ? "text-red-400" : routeData.crowd.current_level === "MEDIUM" ? "text-yellow-400" : "text-green-400"}`}
                >
                  {routeData.crowd.current_level} CROWD
                </Text>
              </View>
            ) : (
              <View className="px-2 py-0.5 rounded bg-light-3/10">
                <Text className="text-xs font-bold text-light-3">
                  Data crowd belum tersedia
                </Text>
              </View>
            )}
            <Text className="text-light-3 text-xs">
              ID: {routeData.route_id}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-light-1">
            Detail Perjalanan
          </Text>
        </View>

        <RouteDetailCard item={routeData} originName={origin} />

        {/* Stats Grid */}
        <View className="flex-row gap-2">
          <InfoCard title={`${routeData.travel_time_minutes}`} desc="Menit" />
          <InfoCard title={`${routeData.transfers}x`} desc="Transit" />
          <InfoCard title={`${routeData.walking_distance_m}m`} desc="Jalan" />
        </View>

        {/* Scores */}
        <View className="bg-dark-2 p-4 rounded-xl gap-4 border border-light-3/5">
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-light-2 text-sm">Tingkat Kenyamanan</Text>
              <Text className="text-light-1 text-sm font-bold">
                {comfortPercent != null ? `${comfortPercent}%` : "Data belum tersedia"}
              </Text>
            </View>
            {comfortPercent != null && (
              <View className="h-1.5 bg-dark-4 rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${comfortPercent}%` }}
                />
              </View>
            )}
          </View>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-light-2 text-sm">
                Reliabilitas (Tepat Waktu)
              </Text>
              <Text className="text-light-1 text-sm font-bold">
                {reliabilityPercent != null ? `${reliabilityPercent}%` : "Data belum tersedia"}
              </Text>
            </View>
            {reliabilityPercent != null && (
              <View className="h-1.5 bg-dark-4 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary-emerald rounded-full"
                  style={{ width: `${reliabilityPercent}%` }}
                />
              </View>
            )}
          </View>

          {departureLabel && (
            <View className="flex-row justify-between items-center pt-2 border-t border-light-3/10">
              <Text className="text-light-2 text-sm">Berangkat Pukul</Text>
              <Text className="text-light-1 text-sm font-semibold">
                {departureLabel}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center pt-2 border-t border-light-3/10">
            <Text className="text-light-2 text-sm">Estimasi Biaya</Text>
            <Text className="text-light-1 text-lg font-bold">
              {formatRupiah(routeData.cost_idr)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full flex-row gap-3">
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/navigate",
                params: {
                  data: JSON.stringify(routeData),
                  origin: origin,
                },
              })
            }
            className="flex-1 items-center py-4 rounded-xl bg-light-1 active:opacity-90"
          >
            <Text className="text-md text-dark-1 font-bold">
              Mulai Navigasi
            </Text>
          </Pressable>
        </View>

        <View className="w-full items-center pt-2">
          <Text className="text-light-3 text-xs text-center w-5/6">
            Data diperbarui pada {new Date().toLocaleTimeString()} • Sumber:
            SmartRoute AI Model
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
