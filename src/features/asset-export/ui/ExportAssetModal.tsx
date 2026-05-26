import { Adaptive } from '@/shared/ui/adaptive'
import { ExportAssetModalDesktop } from './desktop/ExportAssetModalDesktop'
import { ExportAssetModalMobile } from './mobile/ExportAssetModalMobile'

interface ExportAssetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ExportAssetModal(props: ExportAssetModalProps) {
  return (
    <Adaptive
      desktop={<ExportAssetModalDesktop {...props} />}
      mobile={<ExportAssetModalMobile {...props} />}
    />
  )
}
