import { Adaptive } from '@/shared/ui/adaptive'
import { TransactionsPageDesktop } from './TransactionsPage.desktop'
import { TransactionsPageMobile } from './TransactionsPage.mobile'

export function TransactionsPage() {
  return (
    <Adaptive
      desktop={<TransactionsPageDesktop />}
      mobile={<TransactionsPageMobile />}
    />
  )
}
