import { Adaptive } from '@/shared/ui/adaptive'
import { DashboardPageDesktop } from './DashboardPage.desktop'
import { DashboardPageMobile } from './DashboardPage.mobile'

export function DashboardPage() {
  return (
    <Adaptive
      desktop={<DashboardPageDesktop />}
      mobile={<DashboardPageMobile />}
    />
  )
}
