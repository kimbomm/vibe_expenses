export type CategoryType = 'income' | 'expense' | 'payment' | 'asset'

export type CategoryMap = Record<string, string[]>

export interface LedgerCategories {
  income: CategoryMap
  expense: CategoryMap
  payment: CategoryMap
  asset: CategoryMap
}
