import DepartureTimeField, {
  DEFAULT_DEPARTURE_TIME,
  DepartureTimeValue,
} from "@/components/DepartureTimeField";
import QuickLocationCard from "@/components/QuickLocationCard";
import QuickLocationPickerModal from "@/components/QuickLocationPickerModal";
import RealTimeInfoCard from "@/components/RealTimeInfoCard";
import { LocationAutocompleteFieldHandle } from "@/components/LocationAutocompleteField";
import RouteCard from "@/components/RouteCard";
import Text from "@/components/Text";
import { getCurrentLocationLabel } from "@/utils/currentLocation";
import { buildDepartureTimeIso, validateHourMinute } from "@/utils/departureTime";
import { PlaceSuggestion } from "@/utils/geocode";
import {
  getAllQuickLocations,
  QuickLocationSlot,
  removeQuickLocation,
  SavedQuickLocation,
  saveQuickLocation,
} from "@/utils/quickLocations";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

// Perluasan Task App-21 (diminta user langsung): metadata per slot "Tujuan
// Cepat" — satu sumber untuk title/icon/label dialog, dipakai baik untuk
// render kartu maupun untuk teks Alert/modal, supaya tidak ada 3 salinan
// string yang bisa diam-diam berbeda.
const QUICK_LOCATION_SLOTS: {
  slot: QuickLocationSlot;
  title: string;
  iconName: "briefcase" | "school" | "home";
}[] = [
  { slot: "kantor", title: "Kantor", iconName: "briefcase" },
  { slot: "kampus", title: "Kampus", iconName: "school" },
  { slot: "rumah", title: "Rumah", iconName: "home" },
];

export default function Index() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  // Perluasan Task App-21: dipakai handleQuickLocationPress untuk blur()
  // field Tujuan tepat setelah mengisinya dari luar — lihat catatan
  // lengkap di LocationAutocompleteFieldHandle soal bug yang ini perbaiki
  // (keyboard + dropdown "Tidak ada hasil" muncul tak diminta).
  const destinationFieldRef = useRef<LocationAutocompleteFieldHandle>(null);
  // Task App-08: "enabled: false" (toggle di posisi "Sekarang") berarti
  // departure_time TIDAK dikirim ke backend sama sekali di handleSearch
  // (bukan dikirim dengan nilai "waktu sekarang" yang dihitung di sini) —
  // itu penting supaya perilaku default persis sama dengan sebelum task
  // ini: backend sendiri yang menentukan "sekarang" saat menerima request
  // tanpa departure_time, bukan snapshot waktu saat form diisi.
  const [departureTime, setDepartureTime] = useState<DepartureTimeValue>(
    DEFAULT_DEPARTURE_TIME,
  );

  // Task App-05: auto-isi "Dari" via GPS saat layar dibuka. Izin ditolak ->
  // getCurrentLocationLabel mengembalikan null, field tetap kosong seperti
  // semula, tidak ada dialog error. Guard "origin masih kosong" di titik
  // setOrigin (bukan di awal effect) supaya kalau user sempat mengetik
  // manual sebelum GPS+reverse-geocode selesai, hasil GPS yang telat itu
  // tidak menimpa ketikan mereka.
  useEffect(() => {
    let cancelled = false;

    getCurrentLocationLabel().then((result) => {
      if (cancelled || !result) return;
      setOrigin((current) => (current.trim() === "" ? result.label : current));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Perluasan Task App-21 (diminta user langsung): "Tujuan Cepat" yang
  // sebelumnya murni dekoratif (onPress tidak pernah diisi) — sekarang bisa
  // diisi lokasi tersimpan lewat pencarian, lalu tap untuk isi cepat field
  // "Tujuan". Dimuat sekali saat Beranda dibuka; disegarkan lagi tiap
  // berhasil simpan/hapus (lihat handler di bawah) TANPA reload manual.
  const [quickLocations, setQuickLocations] = useState<
    Record<QuickLocationSlot, SavedQuickLocation | null>
  >({ kantor: null, kampus: null, rumah: null });
  const [activePickerSlot, setActivePickerSlot] =
    useState<QuickLocationSlot | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllQuickLocations().then((result) => {
      if (!cancelled) setQuickLocations(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleQuickLocationPress = (slot: QuickLocationSlot) => {
    const saved = quickLocations[slot];
    if (saved) {
      // Sudah diisi -> isi cepat field Tujuan, user tetap tap "Cari Rute
      // Terbaik" sendiri (konsisten dengan alur pencarian yang sudah ada,
      // tidak ada navigasi otomatis yang mengejutkan).
      setDestination(saved.label);
      // Bug dilaporkan dari device fisik: kalau field Tujuan kebetulan
      // masih fokus dari interaksi sebelumnya, mengisinya dari sini
      // memicu keyboard muncul + pencarian otomatis atas nama lokasi
      // yang baru saja disimpan (hampir pasti nol hasil). blur() paksa
      // field-nya tidak fokus — lihat LocationAutocompleteFieldHandle.
      destinationFieldRef.current?.blur();
      return;
    }
    // Belum diisi -> buka dialog cari lokasi untuk slot ini.
    setActivePickerSlot(slot);
  };

  const handleQuickLocationLongPress = (slot: QuickLocationSlot) => {
    const saved = quickLocations[slot];
    // Belum ada apa-apa untuk diubah/dihapus -> long-press di slot kosong
    // tidak melakukan apa-apa (tap biasa sudah membuka dialog isi).
    if (!saved) return;

    const slotMeta = QUICK_LOCATION_SLOTS.find((s) => s.slot === slot)!;
    Alert.alert(slotMeta.title, saved.label, [
      { text: "Ubah Lokasi", onPress: () => setActivePickerSlot(slot) },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await removeQuickLocation(slot);
          setQuickLocations((current) => ({ ...current, [slot]: null }));
        },
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  const handlePickerSelect = async (suggestion: PlaceSuggestion) => {
    const slot = activePickerSlot;
    if (!slot) return;
    const location: SavedQuickLocation = {
      label: suggestion.displayName,
      coordinate: suggestion.coordinate,
    };
    await saveQuickLocation(slot, location);
    setQuickLocations((current) => ({ ...current, [slot]: location }));
    setActivePickerSlot(null);
  };

  // Task Integration-01: sebelumnya tombol ini tidak melakukan apa-apa
  // (mockApiResponse langsung dipakai statis di layar hasil rute). Sekarang
  // asal/tujuan nyata dikirim sebagai search params ke /route, yang
  // memanggil fetchRealRoutes ke backend asli.
  const handleSearch = () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert(
        "Lengkapi dulu",
        "Isi asal dan tujuan sebelum mencari rute.",
      );
      return;
    }

    // Task App-08: cuma bangun & kirim departure_time kalau user benar-benar
    // menyalakan "Atur waktu" — toggle di posisi "Sekarang" berarti param
    // ini tidak disertakan sama sekali (lihat catatan di deklarasi state).
    let departureTimeIso: string | undefined;
    if (departureTime.enabled) {
      const validationError = validateHourMinute(
        departureTime.hour,
        departureTime.minute,
      );
      if (validationError) {
        Alert.alert("Jam tidak valid", validationError);
        return;
      }
      departureTimeIso = buildDepartureTimeIso(
        Number(departureTime.hour),
        Number(departureTime.minute),
      );
    }

    router.push({
      pathname: "/route",
      params: {
        origin: origin.trim(),
        destination: destination.trim(),
        ...(departureTimeIso ? { departureTime: departureTimeIso } : {}),
      },
    });
  };

  return (
    <View className="flex-1 bg-[#18181B]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 items-center gap-6 pt-14 pb-28"
        showsVerticalScrollIndicator={false}
        // Task App-09: tanpa ini, default RN ("never") membuat ScrollView
        // MENYERAP tap di luar TextInput yang sedang fokus untuk menutup
        // keyboard duluan — dropdown saran LocationAutocompleteField jadi
        // terlihat tapi tidak bisa di-tap sama sekali. Ini murni perilaku
        // native (keyboard overlay); tidak ada di web (RN Web tidak punya
        // apa yang perlu "diserap"), makanya lolos verifikasi App-06 yang
        // dites di web. "handled" = kalau tap kena komponen yang punya
        // handler (Pressable-nya dropdown), biarkan itu jalan & keyboard
        // tetap terbuka; kalau tidak kena apa-apa, tetap tutup seperti biasa.
        keyboardShouldPersistTaps="handled"
      >
        {/* Greetings */}
        <View className="gap-2.5">
          <Text className="text-4xl font-bold text-light-1 text-center">
            SmartRoute AI
          </Text>
          <Text className="text-light-2 text-center">
            Hai, Selamat Pagi!{"\n"}Mau ke mana hari ini?
          </Text>
        </View>

        {/* Form Card Input Rute */}
        <RouteCard
          origin={origin}
          destination={destination}
          onOriginChange={setOrigin}
          onDestinationChange={setDestination}
          destinationFieldRef={destinationFieldRef}
        />

        {/* Task App-08: kunci waktu keberangkatan (rehearsal/demo) */}
        <DepartureTimeField value={departureTime} onChange={setDepartureTime} />

        {/* Tombol Action Utama */}
        <Pressable
          onPress={handleSearch}
          className="w-full bg-[#00875A] py-3.5 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-80"
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text className="text-light-1 font-bold text-md">
            Cari Rute Terbaik
          </Text>
        </Pressable>

        {/* Task App-01: entry point ke layar peta kepadatan (web-only) */}
        <Pressable
          onPress={() => router.push("/crowd-map")}
          className="w-full bg-dark-2 rounded-2xl p-4 flex-row items-center gap-3 active:opacity-80 border border-light-3/10"
        >
          <View className="bg-light-1/20 p-2.5 rounded-xl">
            <Ionicons name="map" size={24} color="#FFFFFF" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-light-1 font-bold text-md">
              Peta Kepadatan
            </Text>
            <Text className="text-light-3 text-sm">
              Lihat halte yang lagi padat, berdasar laporan pengguna lain.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#71717A" />
        </Pressable>

        {/* Task App-15: entry point ke layar "Halte Terdekat" — fitur info
            berdiri sendiri (4 moda), sengaja terpisah dari alur cari-rute di
            atas (batasan eksplisit task), mirip pola kartu Peta Kepadatan. */}
        <Pressable
          onPress={() => router.push("/nearby-stops")}
          className="w-full bg-dark-2 rounded-2xl p-4 flex-row items-center gap-3 active:opacity-80 border border-light-3/10"
        >
          <View className="bg-light-1/20 p-2.5 rounded-xl">
            <Ionicons name="navigate" size={24} color="#FFFFFF" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-light-1 font-bold text-md">
              Halte Terdekat
            </Text>
            <Text className="text-light-3 text-sm">
              Cari halte TransJakarta, MRT, LRT, & JakLingko di sekitarmu.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#71717A" />
        </Pressable>

        {/* Task App-22: entry point ke layar Asisten AI — fitur info
            berdiri sendiri (chat wayfinding), mirip pola kartu Peta
            Kepadatan/Halte Terdekat di atas, bukan bagian dari alur
            cari-rute. */}
        <Pressable
          onPress={() => router.push("/assistant")}
          className="w-full bg-dark-2 rounded-2xl p-4 flex-row items-center gap-3 active:opacity-80 border border-light-3/10"
        >
          <View className="bg-light-1/20 p-2.5 rounded-xl">
            <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="text-light-1 font-bold text-md">
              Asisten AI
            </Text>
            <Text className="text-light-3 text-sm">
              Tanya seputar rute & tarif TransJakarta, dijawab dari data GTFS asli.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#71717A" />
        </Pressable>

        {/* Tujuan Cepat */}
        <View className="gap-4 w-full">
          <Text className="text-md w-full text-left text-light-1 font-bold">
            Tujuan Cepat
          </Text>
          <View className="flex-row gap-4">
            {QUICK_LOCATION_SLOTS.map(({ slot, title, iconName }) => (
              <QuickLocationCard
                key={slot}
                title={title}
                iconName={iconName}
                savedLabel={quickLocations[slot]?.label}
                onPress={() => handleQuickLocationPress(slot)}
                onLongPress={() => handleQuickLocationLongPress(slot)}
              />
            ))}
          </View>
        </View>

        {/* Info Real Time */}
        <View className="gap-4 w-full">
          <Text className="text-md w-full text-left text-light-1 font-bold">
            Informasi
          </Text>
          <View className="gap-4">
            {/* Task App-21: sebelumnya dipanggil 2x berturut-turut di sini
                (bukan loop dari array salah — cuma JSX yang ditulis dobel),
                menghasilkan kartu "Lalu Lintas" identik muncul dua kali. */}
            <RealTimeInfoCard />
          </View>
        </View>
      </ScrollView>

      <QuickLocationPickerModal
        visible={activePickerSlot !== null}
        title={
          activePickerSlot
            ? `Atur Lokasi ${QUICK_LOCATION_SLOTS.find((s) => s.slot === activePickerSlot)!.title}`
            : ""
        }
        onClose={() => setActivePickerSlot(null)}
        onSelect={handlePickerSelect}
      />
    </View>
  );
}
