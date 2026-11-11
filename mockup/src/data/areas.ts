/** PRD §12.1 — daftar kelurahan [PERLU DIVERIFIKASI terhadap data resmi BPS/Pemprov DKI]. */
export const AREAS: { kota: string; kecamatan: string; kelurahan: string[] }[] = [
  {
    kota: 'Jakarta Selatan',
    kecamatan: 'Tebet',
    kelurahan: ['Tebet Barat', 'Tebet Timur', 'Kebon Baru', 'Bukit Duri', 'Manggarai', 'Manggarai Selatan', 'Menteng Dalam'],
  },
  {
    kota: 'Jakarta Selatan',
    kecamatan: 'Setiabudi',
    kelurahan: ['Setiabudi', 'Karet', 'Karet Semanggi', 'Karet Kuningan', 'Kuningan Timur', 'Menteng Atas', 'Pasar Manggis', 'Guntur'],
  },
]
