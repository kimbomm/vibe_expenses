import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { TransactionFormContentDesktop } from './TransactionFormContentDesktop'
import type { Transaction } from '@/shared/types'

interface TransactionFormDesktopProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
  transaction?: Transaction
  defaultTransaction?: Transaction
  defaultDate?: Date | null
  onSubmit: (
    data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>
  ) => void
}

export function TransactionFormDesktop({
  open,
  onOpenChange,
  ledgerId,
  transaction,
  defaultTransaction,
  defaultDate,
  onSubmit,
}: TransactionFormDesktopProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{transaction ? '거래 수정' : '거래 추가'}</DialogTitle>
        <DialogDescription>
          {transaction ? '거래 내역을 수정합니다.' : '새로운 거래 내역을 추가합니다.'}
        </DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        <TransactionFormContentDesktop
          ledgerId={ledgerId}
          transaction={transaction}
          defaultTransaction={defaultTransaction}
          defaultDate={defaultDate}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
