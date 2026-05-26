import { Adaptive } from '@/shared/ui/adaptive'
import { LedgersPageDesktop } from './LedgersPage.desktop'
import { LedgersPageMobile } from './LedgersPage.mobile'

export function LedgersPage() {
  return (
    <Adaptive
      desktop={<LedgersPageDesktop />}
      mobile={<LedgersPageMobile />}
    />
  )
}
