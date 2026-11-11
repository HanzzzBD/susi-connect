/** 404 — UI-SPEC §0: "Halaman atau data tidak ditemukan." */
import { useNavigate } from 'react-router-dom'
import { useMock } from '../../app/MockContext'
import { homeFor } from '../../app/navigation'
import { AppBar, ScreenBody } from '../../components/AppBar'
import { EmptyState } from '../../components/StateViews'
import { Button } from '../../components/ui/Button'
import { TEXT } from '../../lib/labels'

export default function NotFound() {
  const navigate = useNavigate()
  const { persona } = useMock()
  return (
    <>
      <AppBar back title="SUSI Connect" />
      <ScreenBody>
        <EmptyState
          text={TEXT.notFound}
          action={
            <Button variant="small" onClick={() => navigate(homeFor(persona))}>
              {TEXT.backHome}
            </Button>
          }
        />
      </ScreenBody>
    </>
  )
}
