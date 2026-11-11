/** 403 — UI-SPEC §0: "Halaman ini hanya untuk <peran>." + tombol "Kembali ke beranda". */
import { ShieldX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMock } from '../../app/MockContext'
import { homeFor } from '../../app/navigation'
import { AppBar, ScreenBody } from '../../components/AppBar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PERSONA_LABEL, TEXT, type Persona } from '../../lib/labels'

export default function Forbidden({ roles }: { roles: Persona[] }) {
  const navigate = useNavigate()
  const { persona } = useMock()
  const label = roles.map((r) => PERSONA_LABEL[r].toLowerCase()).join(', ')
  return (
    <>
      <AppBar back title="SUSI Connect" />
      <ScreenBody>
        <Card className="flex flex-col items-center gap-3 text-center">
          <ShieldX size={32} className="text-muted" aria-hidden />
          <p className="text-sm text-ink">{TEXT.forbidden(label)}</p>
          <Button variant="small" onClick={() => navigate(homeFor(persona))}>
            {TEXT.backHome}
          </Button>
        </Card>
      </ScreenBody>
    </>
  )
}
