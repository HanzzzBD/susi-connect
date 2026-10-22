# DESIGN SUSI Connect — Sistem Desain (web & mobile)

**Tanggal:** 22 Oktober 2026 · **Versi:** 1.1 · **Pemilik:** PM (UI/UX), FS (implementasi)
**Sumber:** web — kode `web/src/` dari smartroute-dashboard (commit `b1787c9`); mobile — app `smartroute/` dari repo smartroute-app (commit `0a92f40`, desain Figma "Collection 1", mockup `docs/Smartroute_mockup.png`) — semua resep "dari kode lama" di bawah disalin dari file yang disebut. Dirujuk dari: SDD §8.7, §8A.1 · UI-SPEC §0, M.

## Log Perubahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.0 | 22 Okt 2026 | Dokumen baru. Keputusan tim: (1) `class="dark"` dipasang di `<html>` agar komponen shadcn ikut gelap — karena tema kini mengikuti sistem, kelas itu dipasang/dilepas otomatis; (2) tetap **monokrom**, warna hanya untuk makna; (3) tema **gelap/terang mengikuti sistem**; (4) mobile **sama persis** dengan web. Akibat (3): kelas lama `dark-1/2`, `light-1/2` diganti **token semantik** `surface`, `surface-2`, `ink`, `ink-2` yang nilainya di mode gelap **sama persis** dengan token lama. |
| 1.1 | 22 Okt 2026 | Hasil audit smartroute-app: **mobile mengikuti desain app SmartRoute** (terang, aksen biru `#0F3FC1` & hijau `#018959`, latar biru malam `#001C43`), bukan gaya dashboard. §7 dan §8.3 ditulis ulang dari `smartroute/tailwind.config.js` & komponennya; tema gelap/terang otomatis **hanya untuk web**; ikon mobile memakai `@expo/vector-icons`. Prinsip 3 diubah. |

---

## 1. Prinsip

1. **Setia ke smartroute-dashboard.** Latar gelap pekat, kartu bergaris tipis, angka & label `font-mono`, judul `font-sans` tebal, panel mengambang yang bisa dilipat, animasi masuk halus. Di mode gelap, hasilnya harus tidak bisa dibedakan dari repo lama.
2. **Monokrom; warna = makna.** Tombol utama memakai `ink` (putih di gelap, hampir hitam di terang), seperti segmen aktif `ViewToggle`. Merah, hijau, kuning, oranye, biru, ungu hanya untuk status, urgensi, bahaya, AI.
3. **Dua platform, dua gaya yang disengaja.** Web (alat operator: moderator, admin, dashboard) memakai gaya smartroute-dashboard; mobile (aplikasi warga, relawan, koordinator) memakai gaya app SmartRoute (§7). Yang **sama** di keduanya: arti warna status/urgensi (§2.3), teks label (`shared/labels.ts`), font Plus Jakarta Sans, dan logo.
4. **Warna tidak pernah sendirian.** Setiap status punya ikon + teks.

## 2. Token

### 2.1 Token semantik (pengganti token lama)

| Token | Arti | Gelap (= token lama) | Terang (baru) [ASUMSI nilai, cek kontras di PM-07] |
| --- | --- | --- | --- |
| `surface` | latar halaman, kartu, panel, modal | `oklch(14.1% 0.005 285.823)` (= `dark-1`) | `oklch(98.5% 0.002 286)` |
| `surface-2` | input, tombol sekunder, isi bar progres, kotak ikon | `oklch(21% 0.006 285.885)` (= `dark-2`) | `oklch(94.5% 0.004 286)` |
| `ink` | teks utama, tombol utama, isi bar progres | `oklch(98.5% 0 none)` (= `light-1`) | `oklch(21% 0.006 286)` |
| `ink-2` | teks sekunder, label, placeholder | `oklch(70.5% 0.015 286.067)` (= `light-2`) | `oklch(46% 0.015 286)` |

Garis & transparansi memakai `ink` dengan opasitas, persis pola lama (`border-light-1/25` → `border-ink/25`).

### 2.2 Warna makna

| Token | Makna | Gelap | Terang [ASUMSI] |
| --- | --- | --- | --- |
| `red-1` | darurat, ditolak, bahaya, aksi destruktif | `oklch(68% 0.16 25)` (lama) | `oklch(55% 0.19 25)` |
| `green-1` | selesai, sah, urgensi rendah | `oklch(76% 0.09 165)` (lama) | `oklch(52% 0.11 165)` |
| `yellow-1` | urgensi sedang, mode cadangan | `oklch(85% 0.14 90)` | `oklch(62% 0.14 80)` |
| `orange-1` | urgensi tinggi | `oklch(74% 0.15 55)` | `oklch(58% 0.16 50)` |
| `blue-1` | diteruskan ke instansi, info | `oklch(72% 0.12 245)` | `oklch(52% 0.14 250)` |
| `violet-1` | keluaran AI | `oklch(72% 0.13 300)` | `oklch(52% 0.15 300)` |

Pola pakai (dari `KpiCard` "Anomali AI" & `FlagSummaryCard`): latar `bg-<warna>/10`, garis `border-<warna>/20`, teks `text-<warna>`.

### 2.3 Status → warna & ikon

| Entitas | Status | Warna | Ikon Remix |
| --- | --- | --- | --- |
| Laporan | menunggu | `ink-2` | `RiTimeLine` |
| Laporan | diverifikasi | `ink` | `RiCheckLine` |
| Laporan | dikoordinasikan | `ink` | `RiTeamLine` |
| Laporan | diteruskan_instansi | `blue-1` | `RiGovernmentLine` |
| Laporan | selesai | `green-1` | `RiCheckDoubleLine` |
| Laporan | ditolak | `red-1` | `RiCloseCircleLine` |
| Urgensi | rendah / sedang / tinggi / darurat | `green-1` / `yellow-1` / `orange-1` / `red-1` | `RiArrowDownLine` / `RiSubtractLine` / `RiArrowUpLine` / `RiAlarmWarningLine` |
| Aksi | direncanakan / berjalan / menunggu_verifikasi / terverifikasi / dibatalkan | `ink-2` / `ink` / `yellow-1` / `green-1` / `red-1` | `RiCalendarLine` / `RiPlayLine` / `RiHourglassLine` / `RiCheckDoubleLine` / `RiCloseLine` |
| Bukti | menunggu / sah / ditolak | `yellow-1` / `green-1` / `red-1` | `RiHourglassLine` / `RiCheckLine` / `RiCloseLine` |
| Hambatan | aktif / menunggu_konfirmasi / kedaluwarsa / dicabut | `orange-1` / `yellow-1` / `ink-2` / `ink-2` | `RiErrorWarningLine` / `RiQuestionLine` / `RiTimerLine` / `RiForbidLine` |
| AI | gemini / cache / aturan | `violet-1` / `violet-1` / `ink-2` | `RiSparkling2Line` / `RiSparkling2Line` / `RiListCheck2` |

Ikon: web `react-icons/ri` (sudah dipakai repo lama). Mobile: `@expo/vector-icons` (Ionicons, MaterialCommunityIcons) seperti app SmartRoute — pilih bentuk terdekat dengan ikon Remix di tabel; tabel padanan disimpan di `mobile/src/constants/statusIcons.ts`.

### 2.4 Penggantian kelas lama (dijalankan sekali di FS-34)

| Lama | Baru |
| --- | --- |
| `bg-dark-1` | `bg-surface` |
| `bg-dark-2` | `bg-surface-2` |
| `bg-dark-1/50`, `bg-dark-2/40`, `bg-dark-2/90` | `bg-surface/50`, `bg-surface-2/40`, `bg-surface-2/90` |
| `text-light-1` | `text-ink` |
| `text-light-2` | `text-ink-2` |
| `border-light-1/25`, `/20`, `/15`, `/10`, `/5` | `border-ink/25`, `/20`, `/15`, `/10`, `/5` |
| `bg-light-1` (tombol/segmen aktif, isi bar) | `bg-ink` |
| `text-dark-1` (teks di atas `bg-light-1`) | `text-surface` |
| `hover:bg-light-1/10` | `hover:bg-ink/10` |
| `placeholder:text-light-2/50` | `placeholder:text-ink-2/50` |
| `text-red-600`, `bg-red-700`, `hover:bg-red-500/20`, `hover:bg-green-500/20` | `text-red-1`, `bg-red-1`, `hover:bg-red-1/20`, `hover:bg-green-1/20` |
| `text-white` (LogoutButton, DigitalClock) | `text-ink` |
| `text-blue-400`, `text-yellow-400`, `text-purple-400`, `text-gray-400`, `bg-green-400` (FleetStatusCard) | dihapus bersama domain armada |

```bash
# dari folder web/src — tinjau diff sebelum commit
grep -rl "dark-1\|dark-2\|light-1\|light-2" . | xargs sed -i \
  -e 's/bg-dark-1/bg-surface/g; s/bg-dark-2/bg-surface-2/g' \
  -e 's/text-light-1/text-ink/g; s/text-light-2/text-ink-2/g' \
  -e 's/border-light-1/border-ink/g; s/bg-light-1/bg-ink/g; s/hover:bg-light-1/hover:bg-ink/g' \
  -e 's/text-dark-1/text-surface/g; s/placeholder:text-light-2/placeholder:text-ink-2/g'
```

## 3. Tipografi

| Peran | Kelas | Contoh asal |
| --- | --- | --- |
| Judul halaman | `text-xl font-sans font-bold text-ink` | Dashboard.tsx `h1` |
| Subjudul halaman | `text-sm text-ink-2 mt-1` | Dashboard.tsx |
| Judul kartu/panel | `text-xl font-sans font-bold text-ink flex items-center gap-2` + ikon `text-xl` | FlagSummaryCard |
| Judul modal | `text-xl font-sans font-bold` | StationDetail |
| Isi & label | `text-sm` + `font-mono` diwarisi kontainer | semua kartu |
| Label kecil / meta | `text-xs text-ink-2` | Leaderboard |
| Label KPI | `text-sm text-ink-2 uppercase` | KpiCard |
| Angka KPI | `text-xl font-bold font-mono` | KpiCard |
| Lencana | `text-[10px] font-bold` | StationRankingCard |
| Jam digital | `font-bold font-mono text-4xl` | DigitalClock |

Font: `--font-sans: "Plus Jakarta Sans"`, `--font-mono: "Source Code Pro"` (fontsource lokal, T13). Kontainer kartu memasang `font-mono`; judul menimpa dengan `font-sans`. Mobile: teks isi minimal 15 pt, label kecil minimal 12 pt (bukan 10 px), lencana 11 pt.

## 4. Spasi, radius, bayangan, lapisan

| Hal | Nilai | Dipakai di |
| --- | --- | --- |
| Padding halaman | `p-6 lg:p-8`, susunan `flex flex-col gap-6` | Dashboard.tsx |
| Padding kartu besar | `p-6`, isi `gap-4` | kartu dashboard |
| Padding KPI | `p-5`, isi `gap-3` | KpiCard |
| Padding panel mengambang | `p-4`, isi `gap-3`, lebar `w-72` | Leaderboard, FlaggedStationsPanel |
| Padding modal | `p-6`, isi `gap-6`, lebar min `min-w-90` | StationDetail |
| Item daftar | `p-3` (ringkas) atau `p-3.5` (baris peringkat) | FlagSummaryCard, StationRankingCard |
| Grid | `gap-4` | Dashboard.tsx |
| Radius | kartu/panel/modal `rounded-xl`; item daftar `rounded-lg`; input/tombol kecil/segmen `rounded-md`; tombol aksi dropdown & sekunder penuh `rounded-sm`; bar progres `rounded-2xl`; lencana `rounded` | — |
| Bayangan | panel `shadow-xl`, tombol pembuka panel `shadow-lg`; kartu dashboard **tanpa** bayangan | Leaderboard |
| Garis kartu | `border border-ink/25`; garis dalam/pemisah `border-ink/10`; input `border-ink/10` | — |
| Lapisan (z) | panel peta `z-50`; ViewToggle & jam `z-100`; modal `fixed inset-0` di atas semuanya | Map.tsx |
| Posisi panel peta | kiri atas `top-6 left-6`; ViewToggle `top-6 right-6`; panel kanan `top-19 right-6`; tombol 3D `bottom-6 left-6`; Logout `bottom-6 right-6` | Map.tsx & komponen |

## 5. Gerak (`motion/react`)

| Pola | Nilai | Asal |
| --- | --- | --- |
| Kartu masuk | `initial {opacity:0, y:12}` → `animate {opacity:1, y:0}`, `duration 0.3`, `delay` berjenjang 0,05 per kartu | KpiCard |
| Panel lipat | `initial {opacity:0, y:-10, height:0}` → `{opacity:1, y:0, height:"auto"}`, `duration 0.3, ease "easeInOut"`, `overflow-hidden` | Leaderboard |
| Ikon panah lipat | `RiArrowDropDownLine` `transition-transform duration-300 ease-in-out`, `rotate-0` terbuka / `-rotate-180` tertutup | Leaderboard |
| Tombol mengambang | `whileHover {scale:1.02}`, `whileTap {scale:0.98}` (tombol 3D: 1.05/0.95) | Leaderboard, Map3DToggle |
| Sorotan segmen aktif | `layoutId` + `transition {type:"spring", stiffness:400, damping:30}` | ViewToggle |
| Modal | latar `opacity 0→1`; kartu `y 20→0` | StationDetail |
| Marker berdenyut | `animate {scale:1.25}`, `repeat Infinity, repeatType "mirror", duration 2, ease "linear"` + glow `blur` | Map.tsx |
| Gerak dikurangi | `prefers-reduced-motion: reduce` / `AccessibilityInfo.isReduceMotionEnabled` → semua di atas tanpa animasi | — |

## 6. Resep komponen web

Setiap resep = string kelas yang ditempel apa adanya. "Asal" menunjukkan file lama yang menjadi sumber.

| Komponen | Resep | Asal |
| --- | --- | --- |
| Halaman (dashboard/kartu) | `h-screen overflow-hidden bg-surface text-ink font-mono p-6 lg:p-8 flex flex-col gap-6 relative` (halaman bergulir: ganti `h-screen overflow-hidden` dengan `min-h-screen`) | Dashboard.tsx |
| Header halaman | `border-b border-ink/25 pb-4 shrink-0` | Dashboard.tsx |
| Kartu | `bg-surface border border-ink/25 rounded-xl p-6 flex flex-col gap-4 font-mono` | FlagSummaryCard |
| KPI | `bg-surface border border-ink/25 rounded-xl p-5 flex flex-col justify-between gap-3 font-mono`; kotak ikon `p-2 rounded-md text-lg bg-surface-2 text-ink`; varian bahaya `bg-red-1/10 text-red-1` | KpiCard |
| Kotak ringkas berwarna | `bg-<warna>/10 border border-<warna>/20 rounded-md p-4 flex flex-col gap-1`; angka `text-xl font-bold text-<warna>` | FlagSummaryCard |
| Tombol pembuka panel | `flex items-center gap-2 bg-surface w-fit border border-ink/25 rounded-md px-4 py-2 text-ink shadow-lg cursor-pointer` + label `text-sm tracking-wide` | Leaderboard |
| Panel mengambang | `bg-surface border border-ink/25 rounded-xl p-4 w-72 shadow-xl flex flex-col gap-3` | Leaderboard |
| Segmen 2 pilihan (panel) | wadah `flex justify-between text-xs`; tombol `py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap w-[calc(50%-4px)]`; aktif `bg-ink text-surface font-bold`; pasif `bg-surface-2 text-ink-2 hover:text-ink`; tab bermakna aktif `bg-<warna>/20 text-<warna> font-bold` | Leaderboard, FlaggedStationsPanel |
| Navigasi (`ViewToggle`) | wadah `fixed top-6 right-6 z-100 flex items-center bg-surface-2/90 backdrop-blur border border-ink/15 rounded-lg p-1 font-mono text-sm shadow-xl`; tombol `relative flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer select-none`; aktif `text-surface font-bold` + latar `motion.div layoutId="viewToggleBackground" className="absolute inset-0 bg-ink rounded-md"`; pasif `text-ink-2 hover:text-ink` | ViewToggle |
| Tombol utama | `bg-ink text-surface font-bold font-mono text-sm px-4 py-2 rounded-md hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed` (turunan segmen aktif — tidak ada tombol utama di repo lama) | ViewToggle (aktif) |
| Tombol sekunder penuh | `w-full py-2 bg-surface-2 hover:bg-ink/10 text-ink rounded-sm text-sm transition-colors border border-ink/10 cursor-pointer` | FlagSummaryCard |
| Tombol di popup/modal | `w-full bg-surface-2 hover:bg-ink/10 border border-ink/15 text-ink font-bold font-mono text-xs py-1.5 rounded-md transition-colors cursor-pointer` | Map.tsx popup "Lihat Lengkap →" |
| Tombol bahaya / sukses | `bg-red-1/10 text-red-1 py-2 flex-1 rounded-sm hover:bg-red-1/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed` (sukses: `green-1`) | StationDetail |
| Tombol ikon | `p-1.5 rounded-md text-ink-2 hover:text-ink hover:bg-ink/10 transition-colors cursor-pointer`; varian `text-red-1/70 hover:text-red-1 hover:bg-red-1/10` | StationRankingCard |
| Dropdown tombol aksi (modal) | pemicu `flex gap-2 items-center justify-center text-ink-2 mt-3` + `RiArrowDropDownLine`; isi `flex gap-4 text-sm` berisi tombol bahaya/sukses | StationDetail |
| Input / pencarian | `w-full bg-surface-2 border border-ink/10 rounded-md pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-2/50 focus:outline-none focus:border-ink/30 transition-colors`; ikon `absolute left-3 top-1/2 -translate-y-1/2 text-ink-2 group-focus-within:text-ink` (tanpa ikon: `px-3`) | FlagSummaryCard, StationRankingCard |
| Select | `bg-surface-2 border border-ink/10 text-ink text-sm rounded-md px-3 py-1.5 outline-none focus:border-ink/30 transition-colors`; `option` `bg-surface text-ink` | StationRankingCard |
| Textarea | resep input + `min-h-28 py-2 resize-y` | turunan |
| Label field | `text-sm text-ink-2` di atas field, `mb-1`; wajib ditandai teks "(wajib)" bukan hanya `*` | turunan |
| Pesan galat field | `text-xs text-red-1 mt-1` + `RiErrorWarningLine` | turunan |
| Item daftar | `group bg-surface-2/40 border border-ink/10 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-ink/25 transition-all text-sm` | StationRankingCard |
| Item daftar ringkas | `p-3 rounded-md border border-ink/10` (bermakna: `border-<warna>/20 bg-<warna>/5`) | FlagSummaryCard |
| Lencana | `text-[10px] px-1.5 py-0.5 rounded bg-<warna>/10 text-<warna> font-bold` + ikon `w-3 h-3` | StationRankingCard |
| Bar progres | wadah `h-1.5 w-full rounded-2xl bg-surface-2 flex`; isi `h-full bg-ink rounded-2xl` (`h-1 rounded-full` untuk ringkas) | StationDetail, Leaderboard |
| Baris kunci–nilai | `flex justify-between` + kunci `text-ink-2` | StationDetail |
| Modal | latar `fixed inset-0 bg-surface/50 backdrop-blur-xs flex justify-center items-center z-[200]`; kartu `relative min-w-90 max-w-xl font-mono bg-surface rounded-xl border border-ink/25 p-6 flex flex-col gap-6 text-ink`; tutup `IoIosClose absolute right-2 top-2 text-2xl text-ink-2` (diberi `aria-label="Tutup"`) | StationDetail |
| Popup peta | `bg-surface border border-ink/25 p-3 rounded-lg shadow-xl` | Map.tsx |
| Tooltip peta | `font-mono text-xs border border-ink/25 bg-surface text-ink px-2 py-1 rounded` | Map.tsx |
| Daftar bergulir | `overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-ink/10 [&::-webkit-scrollbar-thumb]:rounded-full` | StationRankingCard |
| Kosong | `py-8 text-center text-ink-2 text-sm` + ikon `text-3xl mb-2` + tombol sekunder opsional | StationRankingCard |
| Memuat | skeleton `bg-surface-2 animate-pulse rounded-md`; teks `py-4 text-center text-ink-2 animate-pulse` | FlagSummaryCard |
| Galat | kotak `bg-red-1/10 border border-red-1/20 rounded-md p-4 text-sm text-red-1` + tombol sekunder "Coba lagi" | turunan |
| Banner mode cadangan | `w-full bg-yellow-1/10 border-b border-yellow-1/20 text-yellow-1 text-sm font-mono px-4 py-2 flex items-center gap-2` + `RiWifiOffLine` | turunan |
| Banner bahaya | `bg-red-1/10 border border-red-1/20 rounded-md p-4 text-sm text-red-1 flex gap-2` + `RiAlarmWarningLine` | turunan |
| Banner data sintetis | `bg-surface-2 border border-ink/10 rounded-md px-3 py-2 text-xs text-ink-2` + `RiFlaskLine` | turunan |
| Toast | `fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-surface border border-ink/25 rounded-md px-4 py-2 text-sm text-ink shadow-xl`; sukses garis kiri `border-l-4 border-l-green-1`, galat `border-l-red-1` | turunan |
| Lencana AI | `inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-violet-1/10 text-violet-1 font-bold` + `RiSparkling2Line`; aturan: `bg-surface-2 text-ink-2` + `RiListCheck2` | turunan |
| Tombol "Kenapa?" | tombol ikon + teks `text-xs text-ink-2 underline underline-offset-2 hover:text-ink` | turunan |
| Logout | `fixed bottom-6 right-6 z-100 bg-surface hover:bg-red-1 hover:text-surface text-ink px-4 py-2 font-mono rounded-sm border border-ink/25 transition` | LogoutButton |
| Jam digital | `fixed top-6 left-1/2 -translate-x-1/2 z-100 font-bold font-mono text-4xl text-ink bg-surface-2 py-2 px-4 border border-ink/20 rounded-sm` (sembunyi < `lg`) | DigitalClock |
| Layar memuat | `fixed inset-0 z-9999 bg-surface flex flex-col items-center justify-center font-mono text-ink`; judul `text-2xl font-bold tracking-wider mb-8` "SUSI Connect"; bar `w-64 h-1 bg-surface-2 rounded-full` isi `bg-ink` | LoadingScreen |
| Tombol mode 3D | resep di Map3DToggle dengan token baru: `bg-surface/90 text-ink border-ink/25 hover:bg-surface`, aktif `bg-ink text-surface font-bold` | Map3DToggle |
| Marker laporan | titik `w-3 aspect-square rounded-full border border-surface/20` warna urgensi + glow `opacity 0.4–0.8`, `filter blur(10–22px)`; bentuk per status (DESIGN §2.3 / SDD §8.6) | Map.tsx |

**Login (S01)** — repo lama berwarna terang (`bg-gray-100`, kartu putih, tombol biru) dan **diganti**: halaman `min-h-screen bg-surface text-ink font-mono flex items-center justify-center p-6`; kartu `w-full max-w-sm` resep Kartu; judul `text-xl font-sans font-bold text-center`; field resep Input tanpa ikon; tombol resep Tombol utama `w-full`; kotak akun demo = Kartu di bawahnya dengan daftar tombol sekunder penuh.

## 7. Resep mobile (gaya app SmartRoute, NativeWind)

Sumber: `smartroute/tailwind.config.js` dan komponen di `smartroute/src/components/`. NativeWind 4.2.6 + Tailwind 3.4 (bukan Tailwind 4 seperti web). Nama token `surface`/`ink` kebetulan sama dengan web tetapi **nilainya berbeda** — jangan menyalin kelas antar-platform tanpa melihat tabel ini.

### 7.1 Token mobile (dari `smartroute/tailwind.config.js`)

| Token | Nilai | Pakai untuk |
| --- | --- | --- |
| latar layar | `#001C43` (biru malam; `ScreenBackground`, tema navigator) | latar semua layar (tanpa gambar Monas untuk SUSI [ASUMSI]) |
| `surface` / `surface-2` | `#F8FAFC` / `#F4F4F0` | kartu, sheet, tab bar / isi kartu, input |
| `line` | `#D4D4D4` | garis, pembatas, elemen nonaktif |
| `muted` | `#737373` | teks sekunder |
| `ink` / `ink-2` | `#0A0A0A` / `#404040` | teks utama / teks kedua |
| `brand-blue` / `brand-blue-dark` | `#0F3FC1` / `#0F3F80` | tombol utama, tab aktif, tautan |
| `brand-green` | `#018959` | tombol konfirmasi positif (Kirim laporan, Sah, Saya sudah tiba) |
| `brand-orange` | `#FC9D33` | aksen peringatan |
| `accent-red` / `accent-green` / `accent-orange` | `#DC2626` / `#00B074` / `#F59E0B` | status bahaya / selesai / sedang |

**Warna makna di mobile** (arti sama dengan §2.3 web, nilai mobile): darurat & ditolak `accent-red`, tinggi `brand-orange`, sedang `accent-orange`, rendah & selesai `accent-green`, instansi `brand-blue`, AI ungu `#7C3AED` [ASUMSI, token baru `ai`].

### 7.2 Tipografi mobile

Satu keluarga: Plus Jakarta Sans variable (`components/Text.tsx`, ketebalan lewat prop `weight`). Ukuran: isi `text-sm` (14) dan `text-base`, meta `text-xs`, judul layar `text-lg` tebal, angka KPI `text-2xl` tebal. Tidak ada font mono di mobile (gaya app SmartRoute). Teks isi minimal 14 pt.

### 7.3 Resep komponen mobile

| Komponen | Resep (kelas NativeWind) | Asal di `smartroute/src` |
| --- | --- | --- |
| Kartu daftar | `w-full bg-surface rounded-2xl p-4 flex-row items-center gap-3 active:opacity-80 border border-line` | `components/*Card.tsx` |
| Kartu isi | `bg-surface w-full px-5 py-4 rounded-2xl border border-line` | `InfoCard.tsx` |
| Kotak di dalam kartu | `flex-1 bg-surface-2 rounded-xl p-3 gap-0.5` | `ComparisonCard.tsx` |
| Tombol utama | `w-full bg-brand-blue py-4 rounded-2xl items-center active:opacity-90` + teks `text-white font-bold` | layar rute |
| Tombol konfirmasi | `w-full bg-brand-green py-3.5 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-80` (app lama menulis `bg-[#018959]`; SUSI memakai token) | `RouteDetailCard.tsx` |
| Tombol kecil | `bg-brand-blue px-5 py-2.5 rounded-xl` | beberapa layar |
| Tombol ikon bulat | `bg-surface p-2.5 rounded-full border border-line` (mengambang di peta: `bg-surface p-3 rounded-full shadow-md`) | layar peta |
| Kotak ikon | `bg-brand-blue/10 p-2.5 rounded-xl`; ikon bulat `w-9 h-9 rounded-full bg-<warna>/15 items-center justify-center` | `QuickLocationCard.tsx` |
| Input | `flex-row items-center gap-2 bg-surface-2 rounded-xl px-3 py-2.5` + `TextInput` `font-jakarta text-ink` | `LocationAutocompleteField.tsx` |
| Baris daftar | `py-3 border-b border-line active:bg-surface-2` | modal pilihan |
| Modal | latar `BlurView` + `Pressable` penutup; kartu `w-full max-w-[420px] max-h-[75%] bg-surface rounded-2xl overflow-hidden border border-line` | `CrowdReportModal.tsx` |
| Pegangan sheet | `w-10 h-1 rounded-full bg-line self-center` | `CrowdReportModal.tsx` |
| Bar progres | `h-1.5 bg-surface-2 rounded-full overflow-hidden` + isi warna makna | layar kepadatan |
| Pil mengambang | `bg-surface/95 px-4 py-2.5 rounded-full` | layar peta |
| Tab bar | `w-full bg-surface rounded-t-3xl pt-3 pb-6 px-6 flex-row justify-around items-center shadow-lg border-t border-x border-line`; ikon 22, aktif `#0F3FC1`, pasif `#737373`, label `text-xs mt-1` | `CustomTabBar.tsx` |
| Header layar | `Header.tsx` / `TopNav.tsx` (judul putih di atas latar biru malam, tombol kembali bulat) | `components/` |
| Lencana status | `flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-<warna>/15` + teks `text-xs font-bold text-<warna>` + ikon 12 [turunan] | `crowdLevel.ts` (pola warna level) |
| Lencana AI | lencana status dengan warna `ai` + ikon `sparkles` Ionicons, teks "Saran AI"/"Aturan otomatis" | turunan |
| Banner jaringan cadangan | `bg-accent-orange/15 border border-accent-orange/30 rounded-xl px-4 py-2.5` teks `text-sm text-ink` | turunan |
| Kosong / galat | kartu isi dengan ikon 32 `muted`, teks `text-sm text-muted text-center`, tombol kecil | turunan |
| Marker laporan | `Marker` MapLibre v11 dengan `View` bulat warna urgensi + bentuk status (DESIGN §2.3) | `CrowdMapView.native.tsx` |
| Garis rute | `GeoJSONSource` + layer garis `brand-blue`, lebar 4 | `NavigateMap.native.tsx` |

### 7.4 Aturan sentuh & aksesibilitas

Target sentuh ≥ 44 pt; umpan balik `active:opacity-80`/`-90` (bukan ripple); `accessibilityLabel` berbahasa Indonesia di setiap tombol ikon; teks putih hanya di atas `brand-blue`, `brand-green`, atau latar biru malam.

## 8. Tema gelap/terang

### 8.1 Web

`index.html` (sebelum skrip aplikasi, agar tidak berkedip):

```html
<script>
  (function () {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    function apply() { document.documentElement.classList.toggle('dark', mq.matches); }
    apply(); mq.addEventListener('change', apply);
  })();
</script>
```

Kelas `.dark` sekaligus menyalakan variabel shadcn bawaan (`.dark { --background … }` di `index.css`), sehingga `button.tsx`/`card.tsx` ikut tema.

`index.css` — ganti blok `@theme` lama:

```css
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-surface:   var(--susi-surface);
  --color-surface-2: var(--susi-surface-2);
  --color-ink:       var(--susi-ink);
  --color-ink-2:     var(--susi-ink-2);
  --color-red-1:     var(--susi-red);
  --color-green-1:   var(--susi-green);
  --color-yellow-1:  var(--susi-yellow);
  --color-orange-1:  var(--susi-orange);
  --color-blue-1:    var(--susi-blue);
  --color-violet-1:  var(--susi-violet);
  --font-mono: "Source Code Pro Variable", "Source Code Pro", monospace;
  --font-sans: "Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif;
}
:root {            /* terang */
  --susi-surface: oklch(98.5% 0.002 286); --susi-surface-2: oklch(94.5% 0.004 286);
  --susi-ink: oklch(21% 0.006 286);       --susi-ink-2: oklch(46% 0.015 286);
  --susi-red: oklch(55% 0.19 25);   --susi-green: oklch(52% 0.11 165); --susi-yellow: oklch(62% 0.14 80);
  --susi-orange: oklch(58% 0.16 50); --susi-blue: oklch(52% 0.14 250); --susi-violet: oklch(52% 0.15 300);
}
.dark {            /* gelap = token smartroute-dashboard */
  --susi-surface: oklch(14.1% 0.005 285.823); --susi-surface-2: oklch(21% 0.006 285.885);
  --susi-ink: oklch(98.5% 0 none);            --susi-ink-2: oklch(70.5% 0.015 286.067);
  --susi-red: oklch(68% 0.16 25);   --susi-green: oklch(76% 0.09 165); --susi-yellow: oklch(85% 0.14 90);
  --susi-orange: oklch(74% 0.15 55); --susi-blue: oklch(72% 0.12 245); --susi-violet: oklch(72% 0.13 300);
}
```

Opasitas seperti `border-ink/25` tetap bekerja karena Tailwind v4 memakai `color-mix()` untuk warna variabel [PERLU DIVERIFIKASI pada versi Tailwind yang terpasang; uji di FS-34].

### 8.2 Peta

- Web: `Map` mapcn sudah mendeteksi kelas `.dark` pada dokumen (`getDocumentTheme`, map.tsx) dan memilih Carto `dark-matter` atau `positron`; jangan memaksa `theme="dark"` (SDD §8.6 diperbarui).
- Offline: dua style dari `@protomaps/basemaps` — `namedFlavor('dark')` dan `namedFlavor('light')` — dipilih sesuai tema.
- Mobile: `useColorScheme()` → `styleURL` Carto dark-matter/positron, atau style offline sesuai tema.
- Marker, poligon hambatan, dan rute memakai token makna; garis rute `ink` (bukan biru) agar monokrom.

### 8.3 Mobile

Mobile memakai **satu palet** (desain app SmartRoute: kartu terang di atas latar biru malam); tidak ada mode gelap/terang otomatis di MVP. `app.json` `userInterfaceStyle` diubah ke `"light"` agar komponen sistem tidak berganti warna; `StatusBar style="light"` di atas latar biru malam. Peta: style OpenFreeMap/Carto terang saat online (konsisten dengan kartu terang) [ASUMSI], style offline `namedFlavor('light')`.

## 9. Kontras & cek kualitas

| Pasangan | Gelap | Terang | Syarat |
| --- | --- | --- | --- |
| `ink` di `surface` | lulus (≈ putih di hitam) | dicek | ≥ 4,5:1 |
| `ink-2` di `surface` | teks ≥ 14 px saja (pola lama) | dicek | ≥ 4,5:1 untuk teks isi, ≥ 3:1 untuk teks ≥ 18 px |
| `<warna>` di `<warna>/10` | dicek per warna | dicek per warna | ≥ 4,5:1 |
| `surface` di `ink` (tombol utama) | lulus | lulus | ≥ 4,5:1 |

Alat: axe DevTools (web), Accessibility Inspector Android/Xcode (mobile). Nilai terang di §2 adalah usulan awal; bila gagal kontras, ubah di §2 dan `index.css` sekaligus (PR `docs` + `web`).

## 10. Checklist review desain (setiap PR UI)

- [ ] Hanya token: web §2, mobile §7.1; tidak ada `dark-1/light-1`, hex lepas (termasuk `bg-[#018959]` dari app lama → `bg-brand-green`), atau warna Tailwind bawaan (`blue-600`, `gray-100`).
- [ ] Resep komponen dari §6/§7 dipakai apa adanya; variasi baru ditambahkan ke dokumen ini dulu.
- [ ] Web: tampil benar di **gelap dan terang** (tangkapan layar keduanya di PR). Mobile: satu palet.
- [ ] Status punya ikon + teks; tombol ikon punya label aksesibilitas.
- [ ] Angka & label `font-mono`, judul `font-sans font-bold`.
- [ ] Animasi mengikuti §5 dan mati saat gerak dikurangi.
- [ ] Mobile: resep DESIGN §7 (gaya app SmartRoute), target sentuh ≥ 44 pt, teks isi ≥ 14 pt, SafeArea benar di Android & iOS.
