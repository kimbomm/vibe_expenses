import { Adaptive } from '@/shared/ui/adaptive'
import { TransactionFormPageDesktop } from './TransactionFormPage.desktop'
import { TransactionFormPageMobile } from './TransactionFormPage.mobile'

export function TransactionFormPage() {
  return (
    <Adaptive
      desktop={<TransactionFormPageDesktop />}
      mobile={<TransactionFormPageMobile />}
    />
  )
}
