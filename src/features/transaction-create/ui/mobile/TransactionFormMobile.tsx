import { Button } from '@/shared/ui/button'
import { MobileFullscreen } from '@/shared/ui/adaptive'
import { TransactionFormContentMobile } from './TransactionFormContentMobile'
import type { Transaction } from '@/shared/types'

interface TransactionFormMobileProps {
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

export function TransactionFormMobile({
  open,
  onOpenChange,
  ledgerId,
  transaction,
  defaultTransaction,
  defaultDate,
  onSubmit,
}: TransactionFormMobileProps) {
  const title = transaction ? '거래 수정' : '거래 추가'

  return (
    <MobileFullscreen
      open={open}
      title={title}
      onClose={() => onOpenChange(false)}
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={() => {
              const form = document.getElementById(
                'transaction-form'
              ) as HTMLFormElement
              form?.requestSubmit()
            }}
            className="flex-1"
          >
            {transaction ? '수정' : '추가'}
          </Button>
        </div>
      }
    >
      <TransactionFormContentMobile
        ledgerId={ledgerId}
        transaction={transaction}
        defaultTransaction={defaultTransaction}
        defaultDate={defaultDate}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
        showButtons={false}
      />
    </MobileFullscreen>
  )
}
