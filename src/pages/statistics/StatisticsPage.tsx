import { Adaptive } from '@/shared/ui/adaptive'
import { StatisticsPageDesktop } from './StatisticsPage.desktop'
import { StatisticsPageMobile } from './StatisticsPage.mobile'

export function StatisticsPage() {
  return (
    <Adaptive
      desktop={<StatisticsPageDesktop />}
      mobile={<StatisticsPageMobile />}
    />
  )
}
