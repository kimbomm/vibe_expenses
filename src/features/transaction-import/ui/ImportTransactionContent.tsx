import { Adaptive } from '@/shared/ui/adaptive'
import { ImportTransactionContentDesktop } from './desktop/ImportTransactionContentDesktop'
import { ImportTransactionContentMobile } from './mobile/ImportTransactionContentMobile'

interface ImportTransactionContentProps {
  ledgerId: string
  onCancel: () => void
}

export function ImportTransactionContent(props: ImportTransactionContentProps) {
  return (
    <Adaptive
      desktop={<ImportTransactionContentDesktop {...props} />}
      mobile={<ImportTransactionContentMobile {...props} />}
    />
  )
}
