import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { ImportCategoryContentDesktop } from './ImportCategoryContentDesktop'

interface ImportCategoryModalDesktopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ImportCategoryModalDesktop({
  open,
  onOpenChange,
  ledgerId,
}: ImportCategoryModalDesktopProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>카테고리 업로드</DialogTitle>
        <DialogDescription>
          Excel 파일을 업로드하여 카테고리를 일괄 덮어쓰기합니다.
        </DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <ImportCategoryContentDesktop
          ledgerId={ledgerId}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
