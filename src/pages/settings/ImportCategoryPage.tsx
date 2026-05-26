import { Adaptive } from '@/shared/ui/adaptive'
import { ImportCategoryPageDesktop } from './ImportCategoryPage.desktop'
import { ImportCategoryPageMobile } from './ImportCategoryPage.mobile'

export function ImportCategoryPage() {
  return (
    <Adaptive
      desktop={<ImportCategoryPageDesktop />}
      mobile={<ImportCategoryPageMobile />}
    />
  )
}
