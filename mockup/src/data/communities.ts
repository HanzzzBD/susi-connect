/** PRD §12.3 — komunitas (nama berakhiran "(sintetis)"). */
import type { Community } from './types'

export const COMMUNITIES: Community[] = [
  {
    id: 1,
    name: 'Bank Sampah Melati (sintetis)',
    categories: ['sampah'],
    skills: ['angkut', 'pilah', 'dokumentasi'],
    kecamatan: 'Tebet',
    kelurahan: ['Tebet Barat', 'Tebet Timur'],
    base: { lat: -6.22471, lng: 106.8541 },
    availableMembers: 6,
    isSynthetic: true,
  },
  {
    id: 2,
    name: 'Relawan Kampus Hijau (sintetis)',
    categories: ['sampah', 'lingkungan_lain'],
    skills: ['angkut', 'dokumentasi'],
    kecamatan: 'Tebet',
    kelurahan: ['Kebon Baru', 'Bukit Duri'],
    base: { lat: -6.25416, lng: 106.87649 },
    availableMembers: 10,
    isSynthetic: true,
  },
  {
    id: 3,
    name: 'Karang Taruna RW 05 (sintetis)',
    categories: ['umum'],
    skills: ['angkut', 'logistik'],
    kecamatan: 'Tebet',
    kelurahan: ['Tebet Barat'],
    base: { lat: -6.2319, lng: 106.85772 },
    availableMembers: 3,
    isSynthetic: true,
  },
]

export const communityById = (id: number) => COMMUNITIES.find((c) => c.id === id)
