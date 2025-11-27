import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CategoryManager } from '@/components/settings/CategoryManager'
import { useCategoryStore } from '@/stores/categoryStore'

export function CategoriesPage() {
  const { ledgerId } = useParams<{ ledgerId: string }>()
  const fetchCategories = useCategoryStore((state) => state.fetchCategories)

  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  useEffect(() => {
    fetchCategories(ledgerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">카테고리 관리</h1>
        <p className="mt-1 text-muted-foreground">
          수입, 지출, 결제수단, 자산 카테고리를 관리하세요
        </p>
      </div>

      <div className="space-y-6">
        <CategoryManager ledgerId={ledgerId} type="income" />
        <CategoryManager ledgerId={ledgerId} type="expense" />
        <CategoryManager ledgerId={ledgerId} type="payment" />
        <CategoryManager ledgerId={ledgerId} type="asset" />
      </div>
    </div>
  )
}
