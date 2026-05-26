import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { ExportTransactionContentDesktop } from './ExportTransactionContentDesktop'

interface ExportTransactionModalDesktopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ExportTransactionModalDesktop({
  open,
  onOpenChange,
  ledgerId,
}: ExportTransactionModalDesktopProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>거래내역보내기</DialogTitle>
        <DialogDescription>거래내역을 Excel 파일로보냅니다.</DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <ExportTransactionContentDesktop
          ledgerId={ledgerId}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
