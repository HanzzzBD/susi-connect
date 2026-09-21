import { Ionicons } from "@expo/vector-icons";
import { Ref } from "react";
import { View } from "react-native";
import LocationAutocompleteField, {
  LocationAutocompleteFieldHandle,
} from "./LocationAutocompleteField";
import Text from "./Text";

interface RouteCardProps {
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  /**
   * Perluasan Task App-21 (fitur "Tujuan Cepat"): dipakai Beranda memanggil
   * blur() secara imperative tepat setelah mengisi field ini dari luar
   * (bukan dari user mengetik) — lihat catatan lengkap di
   * LocationAutocompleteFieldHandle.
   */
  destinationFieldRef?: Ref<LocationAutocompleteFieldHandle>;
}

export default function RouteCard({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  destinationFieldRef,
}: RouteCardProps) {
  return (
    <View
      className="w-full bg-dark-4 px-4 py-4 rounded-xl gap-2.5"
      // Dropdown saran lokasi di dalam kartu ini absolute & meluber ke bawah,
      // menimpa area DepartureTimeField yang di Beranda adalah sibling
      // BERIKUTNYA — tanpa zIndex di sini, sibling itu selalu menang (urutan
      // render), zIndex di dalam LocationAutocompleteField cuma berlaku antar
      // anak kartu ini, bukan lintas kartu.
      style={{ zIndex: 10 }}
    >
      <Text className="text-light-2 text-md">Dari</Text>
      <LocationAutocompleteField
        value={origin}
        onChange={onOriginChange}
        placeholder="Lokasi Anda"
      />
      <View className="flex-row gap-4 items-center">
        <View className="flex-1 h-[2px] rounded-xl bg-light-1/30"></View>
        <Ionicons name="swap-vertical" size={24} color={"#FFFFFF"} />
      </View>
      <Text className="text-light-2 text-md">Tujuan</Text>
      <LocationAutocompleteField
        ref={destinationFieldRef}
        value={destination}
        onChange={onDestinationChange}
        placeholder="Tujuan Anda"
      />
    </View>
  );
}
