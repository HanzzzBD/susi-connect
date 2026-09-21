// src/components/navigate/NavigateMap.web.tsx
import { Coordinate } from "@/services/mapService";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View } from "react-native";

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
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    useImperativeHandle(ref, () => ({
      flyTo: (center: [number, number], zoom = 15) => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "FLY_TO",
            lat: center[1],
            lng: center[0],
            zoom,
          },
          "*",
        );
      },
    }));

    // Post updates to the Leaflet iframe
    useEffect(() => {
      const targetCoord =
        isFollowingUser && userLocation
          ? userLocation
          : coordinates[isFinished ? coordinates.length - 1 : currentStepIndex];

      if (targetCoord && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: "UPDATE_STATE",
            targetCoord,
            currentStepIndex,
            isFinished,
            userLocation,
            // Task App-19: garis rute yang terpotong (routeGeometry berubah
            // setiap userLocation ter-update, lihat efek "3. LOGIKA TRIMMING
            // ROUTE" di app/navigate.tsx) — dikirim di SINI lewat postMessage
            // + polyline.setLatLngs() di dalam iframe (bukan lewat re-render
            // srcDoc), karena srcDoc yang berubah bikin BROWSER ME-RELOAD
            // SELURUH DOKUMEN iframe dari nol (ubin di-fetch ulang, pan/zoom
            // user hilang) — dibuktikan langsung lewat network log saat
            // investigasi task ini: request ke tiles.openfreemap.org
            // berulang PERSIS tiap userLocation berubah, sebelum perbaikan
            // ini. [lng,lat] GeoJSON dibalik ke [lat,lng] Leaflet, sama
            // seperti konversi polylineCoords awal di bawah.
            routeCoords: routeGeometry
              ? routeGeometry.coordinates.map((c) => [c[1], c[0]])
              : null,
          },
          "*",
        );
      }
    }, [
      currentStepIndex,
      coordinates,
      isFinished,
      isFollowingUser,
      userLocation,
      routeGeometry,
    ]);

    // Task App-19: leafletHtml (jadi juga polylineCoords/markersData di
    // dalamnya) dibangun SEKALI lewat lazy initializer useState — BUKAN
    // dihitung ulang tiap render seperti sebelumnya. Itu penyebab utama bug
    // "peta reload total tiap GPS bergerak": routeGeometry berubah tiap
    // userLocation ter-update (beberapa kali per menit selama navigasi
    // aktif) -> leafletHtml (string) ikut berubah -> React nge-set ulang
    // atribut srcDoc -> browser me-reload SELURUH dokumen iframe (bukan
    // cuma re-render React biasa). Snapshot koordinat awal di sini masih
    // benar dipakai untuk gambar pertama; update SETELAHNYA (termasuk
    // trimming rute) lewat postMessage di efek atas, persis pola FLY_TO
    // yang sudah ada.
    const [leafletHtml] = useState(() => {
      if (coordinates.length === 0) return "";

      const initialCenter = userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : [coordinates[0].latitude, coordinates[0].longitude];

      const polylineCoords = routeGeometry
        ? routeGeometry.coordinates.map((c) => [c[1], c[0]])
        : coordinates.map((c) => [c.latitude, c.longitude]);

      const markersData = coordinates.map((c, i) => ({
        lat: c.latitude,
        lng: c.longitude,
        index: i,
        isOrigin: i === 0,
        isDestination: i === coordinates.length - 1,
      }));

      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <!-- OpenFreeMap tiles are vector tiles rendered via MapLibre GL; this
             bridge plugin lets them plug into Leaflet as a normal layer, so
             the rest of the map (L.map/L.marker/L.polyline below) stays
             plain Leaflet. See Task App-02. -->
        <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css" />
        <script src="https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js"></script>
        <script src="https://unpkg.com/@maplibre/maplibre-gl-leaflet@0.0.20/leaflet-maplibre-gl.js"></script>
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #18181B; }
          .leaflet-control-attribution {
            background: rgba(24, 24, 27, 0.75);
            color: #A1A1AA;
            font-size: 10px;
          }
          .leaflet-control-attribution a { color: #D4D4D8; }
          .step-marker {
            border-radius: 50%;
            border: 2px solid white;
            transition: all 0.3s ease;
          }
          .origin-marker { background: #EF4444; }
          .active-marker { background: #00875A; box-shadow: 0 0 10px #00875A; }
          .default-marker { background: #6B7280; opacity: 0.8; }
          .user-marker {
            width: 14px;
            height: 14px;
            background: #3B82F6;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 8px #3B82F6;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: true
          }).setView([${initialCenter[0]}, ${initialCenter[1]}], 14);

          // OpenFreeMap: free, no API key — replaces CartoDB's dark_all
          // tiles, which now require a key and render an "API KEY REQUIRED"
          // watermark instead of a map. Style URL mirrors the one already
          // proven working in the (shelved) dashboard's Map3DToggle.tsx.
          L.maplibreGL({
            style: 'https://tiles.openfreemap.org/styles/dark',
            attribution:
              'OpenFreeMap &copy; <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
          }).addTo(map);

          const polylineCoords = ${JSON.stringify(polylineCoords)};
          const polyline = L.polyline(polylineCoords, {
            color: '#00875A',
            weight: 5,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          if (polylineCoords.length > 1) {
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
          }

          const markersData = ${JSON.stringify(markersData)};
          const markerInstances = [];

          markersData.forEach((m) => {
            const el = document.createElement('div');
            el.className = 'step-marker ' + (m.isOrigin ? 'origin-marker' : 'default-marker');
            el.style.width = '16px';
            el.style.height = '16px';

            const icon = L.divIcon({
              html: el,
              className: '',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
            markerInstances.push({ marker, el, data: m });
          });

          let userMarker = null;

          function updateUserMarker(userLoc) {
            if (!userLoc) return;
            if (!userMarker) {
              const el = document.createElement('div');
              el.className = 'user-marker';
              const icon = L.divIcon({ html: el, className: '', iconSize: [14, 14], iconAnchor: [7, 7] });
              userMarker = L.marker([userLoc.latitude, userLoc.longitude], { icon }).addTo(map);
            } else {
              userMarker.setLatLng([userLoc.latitude, userLoc.longitude]);
            }
          }

          window.addEventListener('message', (e) => {
            if (!e.data) return;
            if (e.data.type === 'FLY_TO') {
              map.flyTo([e.data.lat, e.data.lng], e.data.zoom || 15, { duration: 0.8 });
            } else if (e.data.type === 'UPDATE_STATE') {
              const { targetCoord, currentStepIndex, isFinished, userLocation, routeCoords } = e.data;
              // Task App-19: update polyline IN PLACE lewat setLatLngs —
              // inilah live-trim rute yang sesungguhnya, tanpa reload
              // dokumen (lihat catatan panjang di komponen React-nya).
              if (routeCoords) {
                polyline.setLatLngs(routeCoords);
              }
              if (targetCoord) {
                map.flyTo([targetCoord.latitude, targetCoord.longitude], 15, { duration: 0.8 });
              }
              if (userLocation) {
                updateUserMarker(userLocation);
              }
              markerInstances.forEach(({ el, data }) => {
                const isActive = isFinished ? data.isDestination : data.index === currentStepIndex;
                if (data.isOrigin) {
                  el.className = 'step-marker origin-marker';
                  el.style.width = isActive ? '22px' : '16px';
                  el.style.height = isActive ? '22px' : '16px';
                } else if (isActive) {
                  el.className = 'step-marker active-marker';
                  el.style.width = '22px';
                  el.style.height = '22px';
                } else {
                  el.className = 'step-marker default-marker';
                  el.style.width = '14px';
                  el.style.height = '14px';
                }
              });
            }
          });
        </script>
      </body>
      </html>
    `;
    });

    if (coordinates.length === 0 || !leafletHtml) return null;

    return (
      <View style={{ flex: 1, backgroundColor: "#18181B" }}>
        <iframe
          ref={iframeRef as any}
          srcDoc={leafletHtml}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            display: "block",
          }}
          title="Route Navigation Map"
        />
      </View>
    );
  },
);

export default NavigateMap;
