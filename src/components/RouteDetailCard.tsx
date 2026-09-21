// src/components/RouteDetailCard.tsx
import { RouteItem } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import Text from "./Text";
import { legModeStyle } from "./transit/legModes";

interface Props {
  item: RouteItem;
  originName: string;
}

export default function RouteDetailCard({ item, originName }: Props) {
  return (
    <View className="bg-dark-2 border border-light-3/10 rounded-xl overflow-hidden">
      <View className="p-4 gap-0">
        {item.legs.map((leg, index) => {
          const isLast = index === item.legs.length - 1;
          const isFirst = index === 0;

          return (
            <View key={index} className="flex-row min-h-[60px]">
              {/* Timeline Column */}
              <View className="w-12 items-center">
                {isFirst ? (
                  <View className="w-3 h-3 rounded-full bg-light-1 mt-1.5" />
                ) : (
                  <View className="w-3 h-3 rounded-full bg-dark-4 border border-light-3 mt-1.5" />
                )}
                {!isLast && (
                  <View className="w-0.5 bg-light-3/30 flex-1 my-1" />
                )}
              </View>

              {/* Content Column */}
              <View className="flex-1 pb-6 pl-2">
                <Text className="text-light-1 font-bold text-base">
                  {isFirst ? originName : leg.from}
                </Text>

                <View className="flex-row items-center gap-2 mt-1 mb-1">
                  {/* Warna moda hanya di ikon (penanda non-teks); teks badge
                      tetap abu terang di latar gelap supaya kontras AA
                      tidak bergantung pada warna moda (oranye JakLingko
                      dengan teks putih tidak lolos AA). */}
                  <View className="bg-dark-4 px-2 py-0.5 rounded border border-light-3/10 flex-row items-center gap-1">
                    <Ionicons
                      name={legModeStyle(leg.mode).icon}
                      size={12}
                      color={legModeStyle(leg.mode).color}
                    />
                    <Text className="text-light-2 text-xs font-semibold uppercase">
                      {leg.mode}
                    </Text>
                  </View>
                  {leg.service && (
                    <Text className="text-light-3 text-xs">{leg.service}</Text>
                  )}
                </View>

                <View className="flex-row items-center gap-1 mt-1">
                  <Ionicons name="arrow-down" size={14} color="#71717A" />
                  <Text className="text-light-2 text-sm">Menuju {leg.to}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Final Destination */}
        <View className="flex-row">
          <View className="w-12 items-center">
            <View className="w-3 h-3 rounded-full bg-primary-emerald mt-1.5" />
          </View>
          <View className="flex-1 pl-2">
            <Text className="text-primary-emerald font-bold text-base">
              {item.legs[item.legs.length - 1].to}
            </Text>
            <Text className="text-light-3 text-xs mt-1">Tiba di tujuan</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
