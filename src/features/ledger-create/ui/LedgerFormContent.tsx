import { Adaptive } from '@/shared/ui/adaptive'
import { LedgerFormContentDesktop } from './desktop/LedgerFormContentDesktop'
import { LedgerFormContentMobile } from './mobile/LedgerFormContentMobile'
import type { Ledger } from '@/shared/types'

interface LedgerFormContentProps {
  ledger?: Ledger
  onSubmit: (data: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>) => void
  onCancel: () => void
  showButtons?: boolean
}

export function LedgerFormContent(props: LedgerFormContentProps) {
  return (
    <Adaptive
      desktop={<LedgerFormContentDesktop {...props} />}
      mobile={<LedgerFormContentMobile {...props} />}
    />
  )
}
