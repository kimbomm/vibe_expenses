import { Adaptive } from '@/shared/ui/adaptive'
import { LayoutDesktop } from './LayoutDesktop'
import { LayoutMobile } from './LayoutMobile'

export function Layout() {
  return <Adaptive desktop={<LayoutDesktop />} mobile={<LayoutMobile />} />
}
