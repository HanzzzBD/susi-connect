// src/components/navigate/NavigateMap.native.tsx
//
// Migrasi dari react-native-maps ke @maplibre/maplibre-react-native — sama
// seperti CrowdMapView.native.tsx (Task App-03). react-native-maps di
// Android memakai Google Maps SDK, yang butuh android.config.googleMaps.
// apiKey di app.json — key itu tidak pernah ada, jadi native map view
// crash total (force close) begitu benar-benar dibuka di device fisik.
// Ditemukan lewat testing APK ngrok (Task Ops-02): "cari rute" aman (tidak
// menyentuh map sama sekali), tapi "navigasi rute" (layar ini) langsung
// crash. MapLibre + OpenFreeMap tidak butuh API key sama sekali — konsisten
// dengan filosofi app ini (OpenFreeMap/Nominatim/OTP2, semua gratis tanpa
// key) dan sudah terbukti stabil di CrowdMapView.native.tsx.
import { Coordinate } from "@/services/mapService";
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  UserLocation,
  type CameraRef,
} from "@maplibre/maplibre-react-native";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet, View } from "react-native";

const OPENFREEMAP_DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";

export interface NavigateMapProps {
  coordinates: Coordinate[];
  routeGeometry: GeoJSON.LineString | null;
  currentStepIndex: number;
  isFinished: boolean;
  userLocation?: Coordinate | null;
  isFollowingUser?: boolean;
}

export interface NavigateMapHandle {
  flyTo: (center: [number, number], zoom?: number) => void;
}

const NavigateMap = forwardRef<NavigateMapHandle, NavigateMapProps>(
  (
    {
      coordinates,
      routeGeometry,
      currentStepIndex,
      isFinished,
      userLocation,
      isFollowingUser,
    },
    ref,
  ) => {
    const cameraRef = useRef<CameraRef>(null);

    useImperativeHandle(ref, () => ({
      flyTo: (center: [number, number], zoom = 16) => {
        // center sudah [longitude, latitude] — format asli MapLibre, tidak
        // perlu dibalik seperti versi react-native-maps sebelumnya.
        cameraRef.current?.easeTo({ center, zoom, duration: 800 });
      },
    }));

    // Auto camera positioning — persis logic react-native-maps sebelumnya,
    // cuma animateCamera({center:{latitude,longitude},zoom}) jadi
    // easeTo({center:[lng,lat],zoom}).
    useEffect(() => {
      if (!cameraRef.current) return;
      if (isFollowingUser && userLocation) {
        cameraRef.current.easeTo({
          center: [userLocation.longitude, userLocation.latitude],
          zoom: 16,
          duration: 800,
        });
        return;
      }
      if (coordinates.length > 0) {
        const targetIndex = isFinished
          ? coordinates.length - 1
          : currentStepIndex;
        const targetCoord = coordinates[targetIndex];
        if (targetCoord) {
          cameraRef.current.easeTo({
            center: [targetCoord.longitude, targetCoord.latitude],
            zoom: 15,
            duration: 800,
          });
        }
      }
    }, [
      currentStepIndex,
      coordinates,
      isFinished,
      isFollowingUser,
      userLocation,
    ]);

    if (coordinates.length === 0) return null;

    const initialCenter: [number, number] = userLocation
      ? [userLocation.longitude, userLocation.latitude]
      : [coordinates[0].longitude, coordinates[0].latitude];

    // GeoJSON LineString [lng, lat] — routeGeometry sudah format ini apa
    // adanya; fallback ke `coordinates` (dikonversi dari {latitude,
    // longitude}) kalau backend tidak mengirim geometry rute.
    const routeLine: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      properties: {},
      geometry: routeGeometry ?? {
        type: "LineString",
        coordinates: coordinates.map((c) => [c.longitude, c.latitude]),
      },
    };

    return (
      <View style={styles.container}>
        {/* Task App-17: akar masalah "lingkaran aneh muncul saat zoom/geser
            peta" — BUKAN lingkaran radius akurasi GPS (UserLocation di
            bawah tidak pernah mengaktifkan prop `accuracy`, jadi layer
            lingkaran itu memang tidak pernah dibuat sama sekali, dicek
            langsung dari source @maplibre/maplibre-react-native). Yang
            sebenarnya: ikon KOMPAS milik MapLibre sendiri. `touchRotate`
            (gestur putar 2-jari) default AKTIF, dan kompas defaultnya cuma
            tersembunyi persis saat peta menghadap utara (bearing 0°) —
            gestur pinch-zoom dengan jari manusia nyaris selalu sedikit
            memutar peta (susah sinkron sempurna), jadi begitu bearing
            bergeser dikit dari 0°, ikon kompas (bentuknya lingkaran)
            langsung muncul di pojok. Matikan rotasi via gestur sekalian —
            peta navigasi turn-by-turn memang tidak butuh bebas diputar
            manual (rute tetap terbaca dari North-up), dan itu mencegah
            AKAR masalahnya (bearing tidak akan pernah bergeser), bukan
            cuma menyembunyikan gejalanya.

            Task App-18: investigasi lanjutan — bug lain yang dilaporkan
            ("gestur 2 jari terasa kurang presisi/gampang muter-miring
            sendiri saat cuma bermaksud geser") adalah SIMPTOM DARI GESTUR
            YANG SAMA, cuma sisi lain darinya: MapLibre menafsirkan satu
            gestur 2-jari kontinu sebagai kombinasi pan+zoom+rotate+pitch
            sekaligus (konvensi umum Mapbox/MapLibre GL). Jari manusia
            jarang bergerak murni translasi lurus tanpa sedikit
            memutar/menekan — touchRotate sudah dimatikan di atas
            (App-17), tapi `touchPitch` (gestur tilt 3D, biasanya trigger
            dari drag 2-jari VERTIKAL) masih default aktif dan BELUM
            disentuh App-17 (App-17 cuma fokus ke gejala "lingkaran",
            bukan soal presisi pan). App ini tidak pernah menampilkan
            peta miring 3D di mana pun — mematikan touchPitch murni
            menghilangkan satu sumber "noise" gestur yang bikin pan
            terasa kurang presisi, tanpa kehilangan fitur yang dipakai. */}
        <Map
          mapStyle={OPENFREEMAP_DARK_STYLE}
          style={styles.map}
          touchRotate={false}
          touchPitch={false}
          compass={false}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{ center: initialCenter, zoom: 15 }}
          />

          <UserLocation animated />

          <GeoJSONSource id="navigateRoute" data={routeLine}>
            {/* `style` di sini deprecated di v11 (disarankan paint/layout),
                tapi masih berfungsi penuh sampai v12 — dipakai apa adanya
                karena paling ringkas untuk satu garis statis seperti ini. */}
            <Layer
              id="navigateRouteLine"
              type="line"
              source="navigateRoute"
              style={{
                lineColor: "#00875A",
                lineWidth: 5,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </GeoJSONSource>

          {coordinates.map((coord, index) => {
            const isActive = isFinished
              ? index === coordinates.length - 1
              : index === currentStepIndex;
            const isOrigin = index === 0;

            return (
              <Marker
                key={`marker-${index}`}
                id={`marker-${index}`}
                lngLat={[coord.longitude, coord.latitude]}
              >
                <View
                  style={[
                    styles.markerDot,
                    {
                      width: isActive ? 24 : 16,
                      height: isActive ? 24 : 16,
                      borderRadius: isActive ? 12 : 8,
                      backgroundColor: isOrigin
                        ? "#EF4444"
                        : isActive
                          ? "#00875A"
                          : "#6B7280",
                      borderWidth: isActive ? 2.5 : 1.5,
                      opacity: isActive || isOrigin ? 1 : 0.75,
                    },
                  ]}
                />
              </Marker>
            );
          })}
        </Map>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#18181B",
  },
  // Eksplisit, bukan StyleSheet.absoluteFillObject — properti itu sudah
  // tidak ada di typing react-native 0.86 (lihat catatan Task App-03).
  map: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  markerDot: {
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default NavigateMap;
