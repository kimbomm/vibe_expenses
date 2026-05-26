import { Adaptive } from '@/shared/ui/adaptive'
import { AssetDetailPageDesktop } from './AssetDetailPage.desktop'
import { AssetDetailPageMobile } from './AssetDetailPage.mobile'

export function AssetDetailPage() {
  return (
    <Adaptive
      desktop={<AssetDetailPageDesktop />}
      mobile={<AssetDetailPageMobile />}
    />
  )
}
