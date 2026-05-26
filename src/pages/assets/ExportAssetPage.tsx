import { Adaptive } from '@/shared/ui/adaptive'
import { ExportAssetPageDesktop } from './ExportAssetPage.desktop'
import { ExportAssetPageMobile } from './ExportAssetPage.mobile'

export function ExportAssetPage() {
  return (
    <Adaptive
      desktop={<ExportAssetPageDesktop />}
      mobile={<ExportAssetPageMobile />}
    />
  )
}
