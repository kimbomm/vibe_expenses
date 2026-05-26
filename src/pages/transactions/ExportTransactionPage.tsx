import { Adaptive } from '@/shared/ui/adaptive'
import { ExportTransactionPageDesktop } from './ExportTransactionPage.desktop'
import { ExportTransactionPageMobile } from './ExportTransactionPage.mobile'

export function ExportTransactionPage() {
  return (
    <Adaptive
      desktop={<ExportTransactionPageDesktop />}
      mobile={<ExportTransactionPageMobile />}
    />
  )
}
