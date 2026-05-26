import { MobileFullscreen } from '@/shared/ui/adaptive'
import { ImportCategoryContentMobile } from './ImportCategoryContentMobile'

interface ImportCategoryModalMobileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ImportCategoryModalMobile({
  open,
  onOpenChange,
  ledgerId,
}: ImportCategoryModalMobileProps) {
  return (
    <MobileFullscreen
      open={open}
      title="카테고리 업로드"
      onClose={() => onOpenChange(false)}
    >
      <ImportCategoryContentMobile
        ledgerId={ledgerId}
        onCancel={() => onOpenChange(false)}
      />
    </MobileFullscreen>
  )
}
