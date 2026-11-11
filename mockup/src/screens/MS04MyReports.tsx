/**
 * M-S04 Laporan saya — UI-SPEC S04 (tab bawah "Laporanku", judul layar "Laporan Saya").
 * [PERLU DIVERIFIKASI] filter "Diproses" tidak didefinisikan; dipakai diverifikasi + dikoordinasikan + diteruskan_instansi.
 */
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../app/MockContext'
import { AppBar, ScreenBody } from '../components/AppBar'
import { ReportCard } from '../components/ReportParts'
import { EmptyState, StdStates } from '../components/StateViews'
import { Button } from '../components/ui/Button'
import { Chip, ChipRow } from '../components/ui/Chip'
import { EVIDENCES } from '../data/evidences'
import { REPORTS } from '../data/reports'
import type { ReportStatus } from '../lib/labels'

const FILTERS: { label: string; statuses?: ReportStatus[] }[] = [
  { label: 'Semua' },
  { label: 'Menunggu', statuses: ['menunggu'] },
  { label: 'Diproses', statuses: ['diverifikasi', 'dikoordinasikan', 'diteruskan_instansi'] },
  { label: 'Selesai', statuses: ['selesai'] },
  { label: 'Ditolak', statuses: ['ditolak'] },
]

export default function MS04MyReports() {
  const { screenState, userId } = useMock()
  const navigate = useNavigate()
  const [filter, setFilter] = useState(0)

  const mine = screenState === 'kosong' ? [] : REPORTS.filter((r) => r.reporterId === userId)
  const statuses = FILTERS[filter].statuses
  const shown = mine.filter((r) => !statuses || statuses.includes(r.status))
  // Lencana "Perlu konfirmasi bukti": ada bukti `after` menunggu (E4)
  const needsConfirm = (id: number) => EVIDENCES.some((e) => e.reportId === id && e.kind === 'after' && e.status === 'menunggu')

  const empty = (
    <EmptyState
      text="Kamu belum pernah melapor."
      action={
        <Button variant="small" onClick={() => navigate('/lapor')}>
          Laporkan masalah
        </Button>
      }
    />
  )

  return (
    <>
      <AppBar title="Laporan Saya" />
      <ScreenBody>
        <StdStates state={screenState}>
          {mine.length === 0 ? (
            empty
          ) : (
            <>
              <ChipRow>
                {FILTERS.map((f, i) => (
                  <Chip key={f.label} onDark active={filter === i} onClick={() => setFilter(i)}>
                    {f.label}
                  </Chip>
                ))}
              </ChipRow>
              {shown.map((r) => (
                <ReportCard key={r.id} report={r} needsConfirmation={needsConfirm(r.id)} onClick={() => navigate(`/laporan/${r.id}`)} />
              ))}
              {shown.length === 0 && <EmptyState text="Belum ada data pada filter ini." />}
              <Button variant="primary" icon={<Plus size={18} />} onClick={() => navigate('/lapor')}>
                Laporan baru
              </Button>
            </>
          )}
        </StdStates>
      </ScreenBody>
    </>
  )
}
