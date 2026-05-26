import { Adaptive } from '@/shared/ui/adaptive'
import { ImportCategoryModalDesktop } from './desktop/ImportCategoryModalDesktop'
import { ImportCategoryModalMobile } from './mobile/ImportCategoryModalMobile'

interface ImportCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ImportCategoryModal(props: ImportCategoryModalProps) {
  return (
    <Adaptive
      desktop={<ImportCategoryModalDesktop {...props} />}
      mobile={<ImportCategoryModalMobile {...props} />}
    />
  )
}
