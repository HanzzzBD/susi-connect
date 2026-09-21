// src/components/LocationAutocompleteField.tsx
//
// Task App-06: satu field lokasi (dipakai untuk "Dari" dan "Tujuan" di
// RouteCard) dengan dropdown saran Nominatim yang di-debounce. Style input
// baris atas sengaja dibuat identik dengan RouteCard sebelum task ini —
// cuma menambah dropdown, bukan mendesain ulang tampilan field.
import { useLocationSuggestions } from "@/hooks/useLocationSuggestions";
import { PlaceSuggestion } from "@/utils/geocode";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import Text from "./Text";

interface LocationAutocompleteFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * Perluasan Task App-21 (diminta user langsung, fitur "Tujuan Cepat"): bug
 * dilaporkan dari screenshot device fisik — tap kartu Tujuan Cepat (BUKAN
 * tap field-nya sendiri) memunculkan keyboard + dropdown "Tidak ada hasil"
 * berisi nama lokasi lengkap yang baru saja diisi programatis. Akar
 * masalahnya: field-nya kebetulan masih fokus dari interaksi SEBELUMNYA
 * (mis. sempat di-tap manual), dan begitu isinya diganti lewat setState
 * dari luar sementara isFocused masih true, useLocationSuggestions (App-06)
 * otomatis menganggapnya "user sedang mengetik" lalu mencari string
 * panjang itu apa adanya — hampir pasti nol hasil (bukan potongan nama
 * tempat yang wajar dicari). blur() imperative ini dipanggil pemanggil
 * (Beranda) TEPAT SETELAH mengisi value dari luar, supaya isFocused
 * langsung false SAAT ITU JUGA (bukan menunggu round-trip event blur
 * native yang lebih lambat & tidak selalu terjadi tepat waktu) — sekaligus
 * menutup keyboard di layar.
 */
export interface LocationAutocompleteFieldHandle {
  blur: () => void;
}

const LocationAutocompleteField = forwardRef<
  LocationAutocompleteFieldHandle,
  LocationAutocompleteFieldProps
>(function LocationAutocompleteField({ value, onChange, placeholder }, ref) {
  const [isFocused, setIsFocused] = useState(false);
  // Tap di item dropdown menyentuh layar SEBELUM TextInput sempat blur
  // (urutan event touch-start vs touch-end) — kalau dropdown langsung
  // hilang begitu blur, Pressable-nya keburu unmount dan tap-nya tidak
  // pernah kena. Blur ditunda dikit supaya onPress sempat jalan dulu; tap
  // suksesnya sendiri yang membatalkan timer ini via clearBlurTimeout().
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Task App-09 Bagian 2: dipakai tombol X untuk fokus ulang ke input
  // setelah mengosongkan field, supaya user bisa langsung ketik ulang tanpa
  // tap dulu ke field-nya.
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    blur: () => {
      clearBlurTimeout();
      inputRef.current?.blur();
      // Set langsung, bukan cuma andalkan event onBlur native — lihat
      // catatan panjang di deklarasi LocationAutocompleteFieldHandle di
      // atas soal kenapa ini harus sinkron dengan pemanggilnya.
      setIsFocused(false);
    },
  }));

  const { suggestions, isLoading } = useLocationSuggestions(value, isFocused);

  const clearBlurTimeout = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  const handleSelect = (suggestion: PlaceSuggestion) => {
    clearBlurTimeout();
    setIsFocused(false);
    // Koordinat suggestion ini sudah di-priming ke geocodeCache oleh
    // searchPlaceSuggestions (lihat geocode.ts) begitu hasil pencarian
    // datang — geocodePlace(displayName) di layar hasil rute nanti
    // otomatis kena cache itu, tidak perlu diteruskan manual dari sini.
    onChange(suggestion.displayName);
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && value.trim().length >= 3;

  return (
    <View style={{ zIndex: isFocused ? 50 : 1 }}>
      <View className="flex-row items-center gap-2">
        <Ionicons name="location" size={19} color="#FFFFFF" />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          onFocus={() => {
            clearBlurTimeout();
            setIsFocused(true);
          }}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => setIsFocused(false), 150);
          }}
          placeholder={placeholder}
          placeholderTextColor="#71717A"
          className="flex-1 text-light-1 font-bold text-lg"
        />
        {isFocused && isLoading && (
          <ActivityIndicator size="small" color="#00875A" />
        )}
        {/* Task App-09 Bagian 2: cuma tampil kalau field ada isi, terlepas
            dari fokus — dropdown pakai isFocused karena butuh kaitan sama
            keyboard, tapi tombol hapus ini murni soal ada/tidaknya teks. */}
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            accessibilityLabel={`Hapus ${placeholder}`}
          >
            <Ionicons name="close-circle" size={18} color="#71717A" />
          </Pressable>
        )}
      </View>

      {showDropdown && (
        <View
          className="absolute left-0 right-0 top-8 bg-dark-2 border border-light-3/15 rounded-xl overflow-hidden"
          style={{ elevation: 8 }}
        >
          {isLoading ? (
            <View className="px-4 py-3 flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#00875A" />
              <Text className="text-light-3 text-sm">Mencari lokasi...</Text>
            </View>
          ) : suggestions.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-light-3 text-sm">
                Tidak ada hasil untuk &quot;{value.trim()}&quot;
              </Text>
            </View>
          ) : (
            suggestions.map((item, index) => (
              <Pressable
                key={`${item.displayName}-${index}`}
                onPress={() => handleSelect(item)}
                className="px-4 py-3 active:bg-dark-4 border-b border-light-3/10 last:border-b-0"
              >
                <Text className="text-light-1 font-bold text-md" numberOfLines={1}>
                  {item.primaryText}
                </Text>
                {item.secondaryText.length > 0 && (
                  <Text className="text-light-3 text-xs mt-0.5" numberOfLines={1}>
                    {item.secondaryText}
                  </Text>
                )}
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
});

export default LocationAutocompleteField;
