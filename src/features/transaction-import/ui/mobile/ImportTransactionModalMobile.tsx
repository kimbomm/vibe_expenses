import { MobileFullscreen } from '@/shared/ui/adaptive'
import { ImportTransactionContentMobile } from './ImportTransactionContentMobile'

interface ImportTransactionModalMobileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ImportTransactionModalMobile({
  open,
  onOpenChange,
  ledgerId,
}: ImportTransactionModalMobileProps) {
  return (
    <MobileFullscreen
      open={open}
      title="거래내역 일괄 업로드"
      onClose={() => onOpenChange(false)}
    >
      <ImportTransactionContentMobile
        ledgerId={ledgerId}
        onCancel={() => onOpenChange(false)}
      />
    </MobileFullscreen>
  )
}
