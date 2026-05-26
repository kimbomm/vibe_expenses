import { Adaptive } from '@/shared/ui/adaptive'
import { LedgerFormPageDesktop } from './LedgerFormPage.desktop'
import { LedgerFormPageMobile } from './LedgerFormPage.mobile'

export function LedgerFormPage() {
  return (
    <Adaptive
      desktop={<LedgerFormPageDesktop />}
      mobile={<LedgerFormPageMobile />}
    />
  )
}
