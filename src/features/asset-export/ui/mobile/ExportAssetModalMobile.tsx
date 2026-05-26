import { MobileFullscreen } from '@/shared/ui/adaptive'
import { ExportAssetContentMobile } from './ExportAssetContentMobile'

interface ExportAssetModalMobileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ExportAssetModalMobile({
  open,
  onOpenChange,
  ledgerId,
}: ExportAssetModalMobileProps) {
  return (
    <MobileFullscreen
      open={open}
      title="자산 현황보내기"
      onClose={() => onOpenChange(false)}
    >
      <ExportAssetContentMobile
        ledgerId={ledgerId}
        onCancel={() => onOpenChange(false)}
      />
    </MobileFullscreen>
  )
}
