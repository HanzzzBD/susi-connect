// src/app/navigate.tsx (VERSI MULTIPLATFORM - MOBILE & WEB)
import ArrivalCelebration from "@/components/navigate/ArrivalCelebration";
import NavigateMap, { NavigateMapHandle } from "@/components/navigate/NavigateMap";
import StepCard from "@/components/navigate/StepCard";
import { legModeStyle } from "@/components/transit/legModes";
import Text from "@/components/Text";
import { RouteItem } from "@/type";
import { geocodePlace, reverseGeocode } from "@/utils/geocode";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  View,
} from "react-native";

type Coordinate = { latitude: number; longitude: number };

// --- API Helpers ---

// Backend mengirim ujung leg jalan kaki sebagai STRING KOORDINAT mentah
// (mis. "-6.24487, 106.80093"), bukan nama tempat — lihat RouteLeg.from/to
// di skema backend. Sebelumnya string itu ikut dilempar ke pencarian teks
// Nominatim, yang SELALU mengembalikan [] (Nominatim mencari nama tempat,
// bukan mem-parse koordinat). Akibatnya titik asal & tujuan tidak pernah
// berhasil di-resolve, dan rute yang cuma jalan kaki (kedua ujungnya
// koordinat) gagal total -> "Gagal memuat rute". Koordinatnya sudah ada di
// depan mata, jadi cukup di-parse langsung — nol panggilan jaringan.
function parseCoordinateString(value: string): Coordinate | null {
  const match = value
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = parseFloat(match[1]);
  const longitude = parseFloat(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

// Task App-14: geocoding nama tempat sekarang SEPENUHNYA lewat
// utils/geocode.ts (geocodePlace, diimpor di atas) — bukan implementasi
// lokal lagi. File ini dulu punya geocodePlace duplikat sendiri (query
// tanpa konteks kota) yang resolve "Kali Besar" ke Kalimantan Selatan,
// bukan Jakarta — satu sumber kebenaran sekarang berarti bug sekelas itu
// cuma perlu diperbaiki sekali, bukan di tiap salinan.
//
// Koordinat dulu (gratis & instan, tidak menyentuh jaringan sama sekali),
// baru geocode kalau memang nama tempat. Tidak perlu jeda manual lagi di
// sini — geocodePlace() sudah throttle sendiri secara global (lihat
// utils/geocode.ts), jeda manual di sini dulu cuma bikin throttle ganda.
async function resolvePoint(name: string): Promise<Coordinate | null> {
  const parsed = parseCoordinateString(name);
  if (parsed) return parsed;
  return geocodePlace(name);
}

async function fetchSegmentPolyline(
  start: Coordinate,
  end: Coordinate,
  mode: string,
): Promise<[number, number][] | null> {
  try {
    const m = mode.toLowerCase();
    if (legModeStyle(mode).isRail)
      return [
        [start.longitude, start.latitude],
        [end.longitude, end.latitude],
      ];

    const profile = m === "walk" ? "foot" : "driving";
    const waypoints = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
    const url = `https://router.project-osrm.org/route/v1/${profile}/${waypoints}?overview=full&geometries=geojson`;
    const res = await fetch(url, {
      headers: { "User-Agent": "SmartRouteApp/1.0" },
    });
    const json = await res.json();
    if (json.code === "Ok" && json.routes?.[0]?.geometry)
      return json.routes[0].geometry.coordinates;
    return [
      [start.longitude, start.latitude],
      [end.longitude, end.latitude],
    ];
  } catch (err) {
    return null;
  }
}

function findClosestPointIndex(
  userCoord: Coordinate,
  polylineCoords: [number, number][],
): number {
  let minDistance = Infinity;
  let closestIndex = 0;
  polylineCoords.forEach((point, index) => {
    const latDiff = point[1] - userCoord.latitude;
    const lngDiff = point[0] - userCoord.longitude;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

// Task App-13: jarak lurus sesungguhnya dalam meter (haversine) — beda dari
// findClosestPointIndex di atas, yang cuma butuh perbandingan RELATIF antar
// titik polyline (Pythagoras lat/lng mentah cukup untuk itu). Deteksi "tiba"
// butuh angka ABSOLUT dalam meter untuk dibandingkan ke radius, jadi tidak
// bisa reuse fungsi itu apa adanya.
function haversineDistanceMeters(a: Coordinate, b: Coordinate): number {
  const EARTH_RADIUS_M = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Di tengah rentang 50-100m yang diminta task — cukup longgar untuk akurasi
// GPS HP biasa (bisa meleset puluhan meter, apalagi di area urban/dekat
// bangunan tinggi), tapi tidak selonggar itu jadi "tiba" padahal masih
// beberapa blok jauhnya.
const ARRIVAL_RADIUS_METERS = 75;

export default function NavigateScreen() {
  const { data, origin } = useLocalSearchParams<{
    data: string;
    origin?: string;
  }>();
  const routeData: RouteItem = JSON.parse(data);
  const router = useRouter();

  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [routeGeometry, setRouteGeometry] = useState<GeoJSON.LineString | null>(
    null,
  );
  const [fullRouteCoords, setFullRouteCoords] = useState<[number, number][]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  // Task App-13: nama tujuan yang enak dibaca untuk layar selamat. Nama dari
  // routeData sering berupa string koordinat mentah (backend mengisi
  // origin/destination.name dengan koordinat) — jelek kalau ditampilkan di
  // layar penutup, jadi di-reverse-geocode dulu.
  const [destinationLabel, setDestinationLabel] = useState<string | null>(null);
  // Task App-17: tinggi StepCard diukur dinamis (isinya berubah-ubah
  // tergantung tab Navigasi/Info Crowd & jumlah langkah rute) supaya tombol
  // GPS lock bisa ditaruh TEPAT di atasnya, bukan angka tebakan yang bisa
  // salah begitu card-nya lebih tinggi/pendek dari perkiraan — pola sama
  // yang sudah dipakai & terbukti di all-stops-map.tsx (Task App-15 lanjutan).
  const [stepCardHeight, setStepCardHeight] = useState(0);

  const mapRef = useRef<NavigateMapHandle>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  // Task App-13: ref (bukan state) — sengaja tidak boleh memicu render
  // ulang sendiri, cuma penanda "sudah pernah otomatis ke-trigger" supaya
  // effect di bawah tidak berulang kali memanggil setIsFinished selama user
  // diam di dalam radius (AC: notifikasi tiba cuma sekali per sesi).
  const hasAutoArrivedRef = useRef(false);

  // --- 1. SETUP LOCATION (REAL GPS) ---
  useEffect(() => {
    let mounted = true;
    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const current = await Location.getCurrentPositionAsync({});
      if (mounted)
        setUserLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          if (mounted)
            setUserLocation({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
        },
      );
    };
    startTracking();
    return () => {
      mounted = false;
      locationSubscription.current?.remove();
    };
  }, []);

  // --- 2. INIT ROUTE ---
  useEffect(() => {
    const initRoute = async () => {
      setIsLoading(true);
      try {
        const pointsToGeocode: string[] = [];
        if (routeData.legs.length > 0)
          pointsToGeocode.push(routeData.legs[0].from);
        routeData.legs.forEach((leg) => pointsToGeocode.push(leg.to));

        // Sejajar 1:1 dengan pointsToGeocode — titik yang gagal disimpan
        // sebagai null, BUKAN dibuang. Sebelumnya hasil gagal langsung tidak
        // di-push, sehingga index-nya bergeser: coords[i] tidak lagi berarti
        // "titik awal leg ke-i", dan segmen berikutnya digambar antar titik
        // yang salah pasangan.
        const resolved: (Coordinate | null)[] = [];
        for (const name of pointsToGeocode) {
          resolved.push(await resolvePoint(name));
        }

        const coords = resolved.filter((c): c is Coordinate => c !== null);
        if (coords.length < 2) {
          setHasError(true);
          return;
        }
        setCoordinates(coords);

        const allCoords: [number, number][] = [];
        for (let i = 0; i < routeData.legs.length; i++) {
          const leg = routeData.legs[i];
          const startCoord = resolved[i];
          const endCoord = resolved[i + 1];
          if (startCoord && endCoord) {
            const segment = await fetchSegmentPolyline(
              startCoord,
              endCoord,
              leg.mode,
            );
            if (segment) allCoords.push(...segment);
          }
        }
        if (allCoords.length > 0) {
          setFullRouteCoords(allCoords);
          setRouteGeometry({ type: "LineString", coordinates: allCoords });
        }
      } catch (err) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    initRoute();
  }, []);

  // --- 3. LOGIKA TRIMMING ROUTE (JALAN OTOMATIS) ---
  useEffect(() => {
    if (!userLocation || fullRouteCoords.length === 0 || isFinished) return;

    const closestIndex = findClosestPointIndex(userLocation, fullRouteCoords);
    const startIndex = Math.max(0, closestIndex - 2);
    const trimmedCoords = fullRouteCoords.slice(startIndex);

    if (
      trimmedCoords.length > 0 &&
      trimmedCoords.length < fullRouteCoords.length
    ) {
      setRouteGeometry({ type: "LineString", coordinates: trimmedCoords });
    }
  }, [userLocation, fullRouteCoords, isFinished]);

  // --- 4. DETEKSI TIBA DI TUJUAN (Task App-13) ---
  // Reuse tampilan "Sampai Tujuan!" yang sudah ada di StepCard (dipicu lewat
  // isFinished, sebelumnya cuma bisa manual — tap "Selesai" atau menuntaskan
  // semua step) — bukan modal terpisah baru. Konsisten: user yang sampai
  // beneran (GPS) dan user yang menandai selesai sendiri lihat layar yang
  // sama persis, tidak ada dua UI "selesai" yang berbeda.
  useEffect(() => {
    if (!userLocation || isFinished || hasAutoArrivedRef.current) return;
    if (coordinates.length === 0) return;

    const destination = coordinates[coordinates.length - 1];
    const distance = haversineDistanceMeters(userLocation, destination);

    if (distance <= ARRIVAL_RADIUS_METERS) {
      hasAutoArrivedRef.current = true;
      setIsFollowingUser(false);
      setIsFinished(true);
    }
  }, [userLocation, coordinates, isFinished]);

  // --- 5. NAMA TUJUAN UNTUK LAYAR SELAMAT (Task App-13) ---
  useEffect(() => {
    if (coordinates.length === 0) return;

    let cancelled = false;
    const resolveLabel = async () => {
      // Nama dari routeData dipakai kalau memang nama tempat sungguhan;
      // kalau isinya string koordinat, baru reverse-geocode.
      const rawName = routeData.legs[routeData.legs.length - 1]?.to ?? "";
      if (rawName && !parseCoordinateString(rawName)) {
        setDestinationLabel(rawName);
        return;
      }

      const destination = coordinates[coordinates.length - 1];
      const label = await reverseGeocode(destination);
      if (!cancelled && label) setDestinationLabel(label);
    };
    resolveLabel();

    return () => {
      cancelled = true;
    };
  }, [coordinates, routeData]);

  // Tombol "Kembali ke Beranda" harus benar-benar ke Beranda. Sebelumnya
  // memakai router.back(), yang cuma mundur SATU layar — dari /navigate itu
  // mendarat di layar detail rute, bukan Beranda (dilaporkan langsung dari
  // testing HP). dismissAll() membuang layar navigasi dari stack root dulu
  // supaya tombol back HP tidak masuk lagi ke navigasi yang sudah selesai,
  // lalu navigate("/") pindah ke tab Beranda.
  const handleGoHome = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate("/");
  };

  const handleNext = () => {
    setIsFollowingUser(false);
    if (currentStepIndex >= routeData.legs.length - 1) setIsFinished(true);
    else setCurrentStepIndex((p) => p + 1);
  };
  const handlePrev = () => {
    setIsFollowingUser(false);
    setCurrentStepIndex((p) => p - 1);
  };

  if (isLoading)
    return (
      <View className="flex-1 bg-[#18181B] items-center justify-center gap-3">
        <ActivityIndicator size="large" color="#00875A" />
        <Text className="text-light-2 text-sm">Memuat rute...</Text>
      </View>
    );
  if (hasError || coordinates.length < 2)
    return (
      <View className="flex-1 bg-[#18181B] items-center justify-center gap-3 px-8">
        <Ionicons name="warning-outline" size={40} color="#EF4444" />
        <Text className="text-light-1 text-center font-bold">
          Gagal memuat rute
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-light-1 px-5 py-2.5 rounded-xl mt-2"
        >
          <Text className="text-dark-1 font-bold">Kembali</Text>
        </Pressable>
      </View>
    );

  const totalSteps = routeData.legs.length;
  const progressPercentage = isFinished
    ? 100
    : Math.round((currentStepIndex / totalSteps) * 100);
  const currentLeg = isFinished ? null : routeData.legs[currentStepIndex];
  const fromName =
    currentStepIndex === 0
      ? (origin ?? routeData.legs[0]?.from ?? "Lokasi Anda")
      : (routeData.legs[currentStepIndex - 1]?.to ?? "");

  return (
    <View className="flex-1 bg-[#18181B]">
      <NavigateMap
        ref={mapRef}
        coordinates={coordinates}
        routeGeometry={routeGeometry}
        currentStepIndex={currentStepIndex}
        isFinished={isFinished}
        userLocation={userLocation}
        isFollowingUser={isFollowingUser}
      />

      {/* Task App-17: cuma tombol back yang tetap di atas sekarang — tombol
          GPS lock pindah ke kanan-bawah (lihat View terpisah di bawah),
          supaya tidak lagi menghalangi pandangan ke peta di area atas. */}
      {!isFinished && (
        <View className="absolute top-14 left-5 z-10">
          <Pressable
            onPress={() => router.back()}
            className="bg-dark-2 p-3 rounded-full shadow-md"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      {/* Task App-17: direposisi dari atas ke kanan-bawah — mudah dijangkau
          jempol saat HP dipegang satu tangan, dan tidak lagi menutupi
          pandangan ke peta di area atas (posisi lama). `bottom` dihitung
          dari tinggi StepCard yang diukur dinamis (stepCardHeight) supaya
          selalu duduk tepat 16px di atas card-nya, persis berapa pun
          tingginya (info tab lebih tinggi dari tab navigasi biasa) — tidak
          pernah tabrakan dengan card ATAUPUN dengan ikon atribusi MapLibre
          (pojok kanan-bawah peta, jauh di bawah posisi ini). */}
      {!isFinished && (
        <View
          className="absolute right-5 z-10"
          style={{ bottom: 32 + stepCardHeight + 16 }}
        >
          <Pressable
            onPress={() => setIsFollowingUser(!isFollowingUser)}
            className={`p-3 rounded-full shadow-lg border ${isFollowingUser ? "bg-primary-emerald border-primary-emerald" : "bg-dark-2 border-light-3/20"}`}
          >
            <Ionicons
              name={isFollowingUser ? "locate" : "locate-outline"}
              size={24}
              color={isFollowingUser ? "#FFFFFF" : "#A1A1AA"}
            />
          </Pressable>
        </View>
      )}

      {/* Task App-13: begitu selesai, StepCard diganti layar selamat penuh —
          bukan ditumpuk, supaya tidak ada dua UI "selesai" bersamaan.
          (Branch isFinished di StepCard jadi tidak terpakai lagi dari sini.) */}
      {!isFinished && (
      <StepCard
        currentLeg={currentLeg}
        totalSteps={totalSteps}
        currentStepIndex={currentStepIndex}
        isFinished={isFinished}
        fromName={fromName}
        progressPercentage={progressPercentage}
        routeData={routeData}
        onNext={handleNext}
        onPrev={handlePrev}
        onFinish={() => {
          setIsFollowingUser(false);
          setIsFinished(true);
        }}
        onBack={handleGoHome}
        onLayout={(e: LayoutChangeEvent) =>
          setStepCardHeight(e.nativeEvent.layout.height)
        }
      />
      )}

      {isFinished && (
        <ArrivalCelebration
          routeData={routeData}
          destinationLabel={destinationLabel}
          onGoHome={handleGoHome}
        />
      )}
    </View>
  );
}
