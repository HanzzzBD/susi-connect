// src/components/QuickLocationPickerModal.tsx
//
// Perluasan Task App-21 (diminta user langsung): dialog cari-&-pilih lokasi
// untuk mengisi/mengubah satu slot "Tujuan Cepat". Struktur Modal+Pressable-
// backdrop mengikuti pola CrowdReportModal.tsx (App-07) — palet gelap yang
// sama, bukan didesain ulang dari nol. Pencarian reuse useLocationSuggestions
// (App-06) apa adanya, sama persis yang dipakai field "Dari"/"Tujuan" di
// RouteCard, supaya hasilnya konsisten (satu sumber kebenaran pencarian
// lokasi, bukan implementasi kedua yang bisa diam-diam berbeda).
import { useLocationSuggestions } from "@/hooks/useLocationSuggestions";
import { PlaceSuggestion } from "@/utils/geocode";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Text from "./Text";

interface QuickLocationPickerModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (suggestion: PlaceSuggestion) => void;
}

export default function QuickLocationPickerModal({
  visible,
  title,
  onClose,
  onSelect,
}: QuickLocationPickerModalProps) {
  const [query, setQuery] = useState("");

  // Reset pencarian tiap dialog dibuka ulang — sisa ketikan dari sesi
  // sebelumnya (mis. slot lain yang dibuka duluan) tidak boleh nyangkut.
  useEffect(() => {
    if (visible) setQuery("");
  }, [visible]);

  const { suggestions, isLoading } = useLocationSuggestions(query, visible);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill}>
        {/* bg-black/80 — lihat catatan sama di CrowdReportModal.tsx soal
            expo-blur tidak sepenuhnya render di react-native-web. */}
        <Pressable
          className="flex-1 justify-center items-center px-6 bg-black/80"
          onPress={onClose}
        >
          <Pressable
            onPress={() => {}}
            className="w-full max-w-[420px] max-h-[75%] bg-dark-2 rounded-2xl overflow-hidden border border-light-3/10"
          >
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="text-light-1 font-bold text-lg">{title}</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <View className="px-5 pb-5 gap-3">
              <View className="flex-row items-center gap-2 bg-dark-4 rounded-xl px-3 py-2.5">
                <Ionicons name="search" size={16} color="#71717A" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Cari nama lokasi..."
                  placeholderTextColor="#71717A"
                  autoFocus
                  className="flex-1 text-light-1 text-md"
                />
                {isLoading && <ActivityIndicator size="small" color="#00875A" />}
              </View>

              {query.trim().length > 0 && query.trim().length < 3 ? (
                <Text className="text-light-3 text-sm text-center py-4">
                  Ketik minimal 3 karakter.
                </Text>
              ) : query.trim().length >= 3 && !isLoading && suggestions.length === 0 ? (
                <Text className="text-light-3 text-sm text-center py-4">
                  Tidak ada lokasi untuk &quot;{query.trim()}&quot;
                </Text>
              ) : (
                <View style={{ maxHeight: 320 }}>
                  {suggestions.map((item, index) => (
                    <Pressable
                      key={`${item.displayName}-${index}`}
                      onPress={() => onSelect(item)}
                      className="py-3 border-b border-light-3/10 active:bg-dark-4"
                    >
                      <Text className="text-light-1 font-semibold text-md" numberOfLines={1}>
                        {item.primaryText}
                      </Text>
                      {item.secondaryText.length > 0 && (
                        <Text className="text-light-3 text-xs mt-0.5" numberOfLines={1}>
                          {item.secondaryText}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
}
