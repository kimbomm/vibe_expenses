/**
 * 카테고리 덮어쓰기 로직
 */

import type { ValidatedCategory } from './categoryValidator'
import { convertToCategoryMap } from './categoryValidator'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import type { CategoryType } from '@/types/category'

export interface UsedCategory {
  type: CategoryType
  category1: string
  category2: string
  count: number
}

/**
 * 기존 거래내역에서 사용 중인 카테고리 확인
 */
export function findUsedCategories(
  ledgerId: string,
  newCategories: ValidatedCategory[]
): UsedCategory[] {
  const transactions = useTransactionStore.getState().transactions[ledgerId] || []
  const usedCategories = new Map<string, number>()

  // 거래내역에서 사용 중인 카테고리 수집
  transactions.forEach((transaction) => {
    const key1 = `expense_${transaction.category1}_${transaction.category2}`
    const key2 = `income_${transaction.category1}_${transaction.category2}`
    const key = transaction.type === 'expense' ? key1 : key2

    usedCategories.set(key, (usedCategories.get(key) || 0) + 1)
  })

  // 새 카테고리와 비교하여 사용 중인 것만 필터링
  const result: UsedCategory[] = []

  newCategories.forEach((newCategory) => {
    const category2List = newCategory.category2

    category2List.forEach((category2) => {
      const key = `${newCategory.type}_${newCategory.category1}_${category2}`
      const count = usedCategories.get(key) || 0

      if (count > 0) {
        result.push({
          type: newCategory.type,
          category1: newCategory.category1,
          category2,
          count,
        })
      }
    })
  })

  return result
}

/**
 * 카테고리 덮어쓰기
 */
export async function importCategories(
  categories: ValidatedCategory[],
  ledgerId: string
): Promise<void> {
  const updateCategoryGroup = useCategoryStore.getState().updateCategoryGroup

  // 타입별로 그룹화
  const types: CategoryType[] = ['income', 'expense', 'payment', 'asset']

  for (const type of types) {
    const categoryMap = convertToCategoryMap(categories, type)
    if (Object.keys(categoryMap).length > 0) {
      await updateCategoryGroup(ledgerId, type, () => categoryMap)
    }
  }

  // 카테고리 다시 로드
  await useCategoryStore.getState().fetchCategories(ledgerId)
}
