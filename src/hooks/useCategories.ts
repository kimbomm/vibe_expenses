import { useEffect, useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import { useCategoryStore } from '@/stores/categoryStore'
import { getDefaultCategories } from '@/lib/firebase/categories'

export function useCategories(ledgerId: string) {
  const ledgerCategories = useCategoryStore((state) => state.categories[ledgerId])
  const fetchCategories = useCategoryStore((state) => state.fetchCategories)

  useEffect(() => {
    if (!ledgerId) return
    fetchCategories(ledgerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId])

  const categories = useMemo(() => {
    return ledgerCategories || getDefaultCategories()
  }, [ledgerCategories])

  const getIncomeCategory1List = () => Object.keys(categories.income)
  const getIncomeCategory2List = (category1: string) => categories.income[category1] || []

  const getExpenseCategory1List = () => Object.keys(categories.expense)
  const getExpenseCategory2List = (category1: string) => categories.expense[category1] || []

  const getPaymentMethod1List = () => Object.keys(categories.payment)
  const getPaymentMethod2List = (method1: string) => categories.payment[method1] || []

  const getAssetCategory1List = () => Object.keys(categories.asset)
  const getAssetCategory2List = (category1: string) => categories.asset[category1] || []

  return {
    getIncomeCategory1List,
    getIncomeCategory2List,
    getExpenseCategory1List,
    getExpenseCategory2List,
    getPaymentMethod1List,
    getPaymentMethod2List,
    getAssetCategory1List,
    getAssetCategory2List,
  }
}
