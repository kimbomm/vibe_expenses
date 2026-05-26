import { Adaptive } from '@/shared/ui/adaptive'
import { ImportTransactionModalDesktop } from './desktop/ImportTransactionModalDesktop'
import { ImportTransactionModalMobile } from './mobile/ImportTransactionModalMobile'

interface ImportTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ImportTransactionModal(props: ImportTransactionModalProps) {
  return (
    <Adaptive
      desktop={<ImportTransactionModalDesktop {...props} />}
      mobile={<ImportTransactionModalMobile {...props} />}
    />
  )
}
