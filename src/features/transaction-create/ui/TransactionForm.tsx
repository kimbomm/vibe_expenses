import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { TransactionFormContent } from './TransactionFormContent'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'
import type { Transaction } from '@/shared/types'

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
  transaction?: Transaction
  defaultTransaction?: Transaction
  defaultDate?: Date | null
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>) => void
}

export function TransactionForm({
  open,
  onOpenChange,
  ledgerId,
  transaction,
  defaultTransaction,
  defaultDate,
  onSubmit,
}: TransactionFormProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  // 모바일일 때는 페이지로 이동
  useEffect(() => {
    if (open && isMobile) {
      const path = transaction
        ? `/ledgers/${ledgerId}/transactions/${transaction.id}/edit`
        : `/ledgers/${ledgerId}/transactions/new`
      navigate(path, {
        state: {
          returnPath: location.pathname,
          defaultDate: defaultDate,
          defaultTransaction: defaultTransaction,
        },
      })
      onOpenChange(false)
    }
  }, [
    open,
    isMobile,
    ledgerId,
    transaction,
    defaultDate,
    defaultTransaction,
    navigate,
    location.pathname,
    onOpenChange,
  ])

  // 모바일이면 모달을 렌더링하지 않음
  if (isMobile || !open) {
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
        <TransactionFormContent
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
