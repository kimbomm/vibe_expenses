import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { LedgerFormContentDesktop } from './LedgerFormContentDesktop'
import type { Ledger } from '@/shared/types'

interface LedgerFormDesktopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledger?: Ledger
  onSubmit: (data: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>) => void
}

export function LedgerFormDesktop({
  open,
  onOpenChange,
  ledger,
  onSubmit,
}: LedgerFormDesktopProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{ledger ? '가계부 수정' : '가계부 추가'}</DialogTitle>
        <DialogDescription>
          {ledger ? '가계부 정보를 수정합니다.' : '새로운 가계부를 생성합니다.'}
        </DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        <LedgerFormContentDesktop
          ledger={ledger}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
