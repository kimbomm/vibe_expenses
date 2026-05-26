import { Adaptive } from '@/shared/ui/adaptive'
import { TransactionFormContentDesktop } from './desktop/TransactionFormContentDesktop'
import { TransactionFormContentMobile } from './mobile/TransactionFormContentMobile'
import type { Transaction } from '@/shared/types'

interface TransactionFormContentProps {
  ledgerId: string
  transaction?: Transaction
  defaultTransaction?: Transaction
  defaultDate?: Date | null
  onSubmit: (
    data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>
  ) => void
  onCancel: () => void
  showButtons?: boolean
}

export function TransactionFormContent(props: TransactionFormContentProps) {
  return (
    <Adaptive
      desktop={<TransactionFormContentDesktop {...props} />}
      mobile={<TransactionFormContentMobile {...props} />}
    />
  )
}
