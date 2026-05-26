import { Adaptive } from '@/shared/ui/adaptive'
import { CategoryManagerDesktop } from './CategoryManager.desktop'
import { CategoryManagerMobile } from './CategoryManager.mobile'

interface CategoryManagerProps {
  ledgerId: string
  type: import('@/shared/types').CategoryType
}

export function CategoryManager({ ledgerId, type }: CategoryManagerProps) {
  return (
    <Adaptive
      desktop={<CategoryManagerDesktop ledgerId={ledgerId} type={type} />}
      mobile={<CategoryManagerMobile ledgerId={ledgerId} type={type} />}
    />
  )
}
