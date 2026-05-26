import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { AssetFormContentDesktop } from './AssetFormContentDesktop'
import type { Asset } from '@/shared/types'

interface AssetFormDesktopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
  asset?: Asset
  onSubmit: (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => void
}

export function AssetFormDesktop({
  open,
  onOpenChange,
  ledgerId,
  asset,
  onSubmit,
}: AssetFormDesktopProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{asset ? '자산 수정' : '자산 추가'}</DialogTitle>
        <DialogDescription>
          {asset ? '자산 정보를 수정합니다.' : '새로운 자산을 추가합니다.'}
        </DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        <AssetFormContentDesktop
          ledgerId={ledgerId}
          asset={asset}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
