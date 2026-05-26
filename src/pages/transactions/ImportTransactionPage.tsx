import { Adaptive } from '@/shared/ui/adaptive'
import { ImportTransactionPageDesktop } from './ImportTransactionPage.desktop'
import { ImportTransactionPageMobile } from './ImportTransactionPage.mobile'

export function ImportTransactionPage() {
  return (
    <Adaptive
      desktop={<ImportTransactionPageDesktop />}
      mobile={<ImportTransactionPageMobile />}
    />
  )
}
