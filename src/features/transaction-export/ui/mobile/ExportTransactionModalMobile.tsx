import { MobileFullscreen } from '@/shared/ui/adaptive'
import { ExportTransactionContentMobile } from './ExportTransactionContentMobile'

interface ExportTransactionModalMobileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ExportTransactionModalMobile({
  open,
  onOpenChange,
  ledgerId,
}: ExportTransactionModalMobileProps) {
  return (
    <MobileFullscreen
      open={open}
      title="거래내역보내기"
      onClose={() => onOpenChange(false)}
    >
      <ExportTransactionContentMobile
        ledgerId={ledgerId}
        onCancel={() => onOpenChange(false)}
      />
    </MobileFullscreen>
  )
}
