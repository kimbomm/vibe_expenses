import { useMemo } from 'react'
import { useMockDataStore } from '@/stores/mockDataStore'

export function useCategories(ledgerId: string) {
  const store = useMockDataStore()

  const categories = useMemo(() => {
    return {
      income: store.getCategories(ledgerId, 'income'),
      expense: store.getCategories(ledgerId, 'expense'),
      payment: store.getCategories(ledgerId, 'payment'),
      asset: store.getCategories(ledgerId, 'asset'),
    }
  }, [ledgerId, store])

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
