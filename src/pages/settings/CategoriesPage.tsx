import { Adaptive } from '@/shared/ui/adaptive'
import { CategoriesPageDesktop } from './CategoriesPage.desktop'
import { CategoriesPageMobile } from './CategoriesPage.mobile'

export function CategoriesPage() {
  return (
    <Adaptive
      desktop={<CategoriesPageDesktop />}
      mobile={<CategoriesPageMobile />}
    />
  )
}
