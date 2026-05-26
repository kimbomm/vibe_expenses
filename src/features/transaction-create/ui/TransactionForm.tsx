import { Adaptive } from '@/shared/ui/adaptive'
import { TransactionFormDesktop } from './desktop/TransactionFormDesktop'
import { TransactionFormMobile } from './mobile/TransactionFormMobile'
import type { Transaction } from '@/shared/types'

interface TransactionFormProps {
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

export function TransactionForm(props: TransactionFormProps) {
  return (
    <Adaptive
      desktop={<TransactionFormDesktop {...props} />}
      mobile={<TransactionFormMobile {...props} />}
    />
  )
}
