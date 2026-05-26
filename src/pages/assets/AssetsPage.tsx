import { Adaptive } from '@/shared/ui/adaptive'
import { AssetsPageDesktop } from './AssetsPage.desktop'
import { AssetsPageMobile } from './AssetsPage.mobile'

export function AssetsPage() {
  return (
    <Adaptive
      desktop={<AssetsPageDesktop />}
      mobile={<AssetsPageMobile />}
    />
  )
}
