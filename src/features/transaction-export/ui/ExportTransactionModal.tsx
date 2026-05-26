import { Adaptive } from '@/shared/ui/adaptive'
import { ExportTransactionModalDesktop } from './desktop/ExportTransactionModalDesktop'
import { ExportTransactionModalMobile } from './mobile/ExportTransactionModalMobile'

interface ExportTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ExportTransactionModal(props: ExportTransactionModalProps) {
  return (
    <Adaptive
      desktop={<ExportTransactionModalDesktop {...props} />}
      mobile={<ExportTransactionModalMobile {...props} />}
    />
  )
}
