import { Adaptive } from '@/shared/ui/adaptive'
import { ExportTransactionContentDesktop } from './desktop/ExportTransactionContentDesktop'
import { ExportTransactionContentMobile } from './mobile/ExportTransactionContentMobile'

interface ExportTransactionContentProps {
  ledgerId: string
  onCancel: () => void
}

export function ExportTransactionContent(props: ExportTransactionContentProps) {
  return (
    <Adaptive
      desktop={<ExportTransactionContentDesktop {...props} />}
      mobile={<ExportTransactionContentMobile {...props} />}
    />
  )
}
