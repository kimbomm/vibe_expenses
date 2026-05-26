import { Adaptive } from '@/shared/ui/adaptive'
import { LedgerFormDesktop } from './desktop/LedgerFormDesktop'
import { LedgerFormMobile } from './mobile/LedgerFormMobile'
import type { Ledger } from '@/shared/types'

interface LedgerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledger?: Ledger
  onSubmit: (data: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>) => void
}

export function LedgerForm(props: LedgerFormProps) {
  return (
    <Adaptive
      desktop={<LedgerFormDesktop {...props} />}
      mobile={<LedgerFormMobile {...props} />}
    />
  )
}
