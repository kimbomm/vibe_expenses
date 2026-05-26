import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { ImportTransactionContentDesktop } from './ImportTransactionContentDesktop'

interface ImportTransactionModalDesktopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ImportTransactionModalDesktop({
  open,
  onOpenChange,
  ledgerId,
}: ImportTransactionModalDesktopProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>거래내역 일괄 업로드</DialogTitle>
        <DialogDescription>
          Excel 파일을 업로드하여 거래내역을 일괄 추가합니다.
        </DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <ImportTransactionContentDesktop
          ledgerId={ledgerId}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
