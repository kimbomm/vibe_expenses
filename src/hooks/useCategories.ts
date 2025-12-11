import { useEffect, useMemo } from 'react'
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

  const getIncomeCategory1List = () =>
    Object.keys(categories.income).sort((a, b) => b.localeCompare(a))
  const getIncomeCategory2List = (category1: string) =>
    (categories.income[category1] || []).sort((a, b) => b.localeCompare(a))

  const getExpenseCategory1List = () =>
    Object.keys(categories.expense).sort((a, b) => b.localeCompare(a))
  const getExpenseCategory2List = (category1: string) =>
    (categories.expense[category1] || []).sort((a, b) => b.localeCompare(a))

  const getPaymentMethod1List = () =>
    Object.keys(categories.payment).sort((a, b) => b.localeCompare(a))
  const getPaymentMethod2List = (method1: string) =>
    (categories.payment[method1] || []).sort((a, b) => b.localeCompare(a))

  const getAssetCategory1List = () =>
    Object.keys(categories.asset).sort((a, b) => b.localeCompare(a))
  const getAssetCategory2List = (category1: string) =>
    (categories.asset[category1] || []).sort((a, b) => b.localeCompare(a))

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
