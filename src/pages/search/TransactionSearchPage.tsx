import { Adaptive } from '@/shared/ui/adaptive'
import { TransactionSearchPageDesktop } from './TransactionSearchPage.desktop'
import { TransactionSearchPageMobile } from './TransactionSearchPage.mobile'

export function TransactionSearchPage() {
  return (
    <Adaptive
      desktop={<TransactionSearchPageDesktop />}
      mobile={<TransactionSearchPageMobile />}
    />
  )
}
