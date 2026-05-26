import { Adaptive } from '@/shared/ui/adaptive'
import { ExportAssetContentDesktop } from './desktop/ExportAssetContentDesktop'
import { ExportAssetContentMobile } from './mobile/ExportAssetContentMobile'

interface ExportAssetContentProps {
  ledgerId: string
  onCancel: () => void
}

export function ExportAssetContent(props: ExportAssetContentProps) {
  return (
    <Adaptive
      desktop={<ExportAssetContentDesktop {...props} />}
      mobile={<ExportAssetContentMobile {...props} />}
    />
  )
}
