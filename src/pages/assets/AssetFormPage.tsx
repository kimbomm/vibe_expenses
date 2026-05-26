import { Adaptive } from '@/shared/ui/adaptive'
import { AssetFormPageDesktop } from './AssetFormPage.desktop'
import { AssetFormPageMobile } from './AssetFormPage.mobile'

export function AssetFormPage() {
  return (
    <Adaptive
      desktop={<AssetFormPageDesktop />}
      mobile={<AssetFormPageMobile />}
    />
  )
}
