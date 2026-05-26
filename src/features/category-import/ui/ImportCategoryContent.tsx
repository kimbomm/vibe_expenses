import { Adaptive } from '@/shared/ui/adaptive'
import { ImportCategoryContentDesktop } from './desktop/ImportCategoryContentDesktop'
import { ImportCategoryContentMobile } from './mobile/ImportCategoryContentMobile'

interface ImportCategoryContentProps {
  ledgerId: string
  onCancel: () => void
}

export function ImportCategoryContent(props: ImportCategoryContentProps) {
  return (
    <Adaptive
      desktop={<ImportCategoryContentDesktop {...props} />}
      mobile={<ImportCategoryContentMobile {...props} />}
    />
  )
}
