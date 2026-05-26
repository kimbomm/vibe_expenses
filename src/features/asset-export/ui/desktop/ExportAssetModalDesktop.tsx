import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { ExportAssetContentDesktop } from './ExportAssetContentDesktop'

interface ExportAssetModalDesktopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ExportAssetModalDesktop({
  open,
  onOpenChange,
  ledgerId,
}: ExportAssetModalDesktopProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>자산 현황보내기</DialogTitle>
        <DialogDescription>자산 현황을 Excel 파일로보냅니다.</DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <ExportAssetContentDesktop
          ledgerId={ledgerId}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
