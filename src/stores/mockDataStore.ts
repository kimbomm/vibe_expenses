import { create } from 'zustand'
import type { Transaction, Asset, Ledger } from '@/types'
import { mockTransactions, mockAssets, mockLedgers, mockUser } from '@/lib/mocks/mockData'
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  ASSET_CATEGORIES,
} from '@/constants/categories'

type CategoryType = 'income' | 'expense' | 'payment' | 'asset'

interface MockDataState {
  // Data
  transactions: Transaction[]
  assets: Asset[]
  ledgers: Ledger[]

  // Categories (가계부별 관리: Record<ledgerId, Record<category1, category2[]>>)
  incomeCategories: Record<string, Record<string, string[]>>
  expenseCategories: Record<string, Record<string, string[]>>
  paymentMethods: Record<string, Record<string, string[]>>
  assetCategories: Record<string, Record<string, string[]>>

  // Transactions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void

  // Assets
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void
  updateAsset: (id: string, asset: Partial<Asset>) => void
  deleteAsset: (id: string) => void

  // Ledgers
  addLedger: (
    ledger: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>
  ) => void
  updateLedger: (id: string, ledger: Partial<Ledger>) => void
  deleteLedger: (id: string) => void

  // Categories (가계부별)
  addCategory1: (ledgerId: string, type: CategoryType, name: string) => void
  updateCategory1: (ledgerId: string, type: CategoryType, oldName: string, newName: string) => void
  deleteCategory1: (ledgerId: string, type: CategoryType, name: string) => void
  addCategory2: (ledgerId: string, type: CategoryType, category1: string, name: string) => void
  updateCategory2: (
    ledgerId: string,
    type: CategoryType,
    category1: string,
    oldName: string,
    newName: string
  ) => void
  deleteCategory2: (ledgerId: string, type: CategoryType, category1: string, name: string) => void
  getCategories: (ledgerId: string, type: CategoryType) => Record<string, string[]>
}

export const useMockDataStore = create<MockDataState>((set, get) => {
  // 기존 가계부들의 카테고리 초기화
  const initialCategories: {
    incomeCategories: Record<string, Record<string, string[]>>
    expenseCategories: Record<string, Record<string, string[]>>
    paymentMethods: Record<string, Record<string, string[]>>
    assetCategories: Record<string, Record<string, string[]>>
  } = {
    incomeCategories: {},
    expenseCategories: {},
    paymentMethods: {},
    assetCategories: {},
  }

  mockLedgers.forEach((ledger) => {
    initialCategories.incomeCategories[ledger.id] = Object.fromEntries(
      Object.entries(INCOME_CATEGORIES).map(([key, value]) => [key, [...value]])
    ) as Record<string, string[]>
    initialCategories.expenseCategories[ledger.id] = Object.fromEntries(
      Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => [key, [...value]])
    ) as Record<string, string[]>
    initialCategories.paymentMethods[ledger.id] = Object.fromEntries(
      Object.entries(PAYMENT_METHODS).map(([key, value]) => [key, [...value]])
    ) as Record<string, string[]>
    initialCategories.assetCategories[ledger.id] = Object.fromEntries(
      Object.entries(ASSET_CATEGORIES).map(([key, value]) => [key, [...value]])
    ) as Record<string, string[]>
  })

  return {
    // Initial state
    transactions: [...mockTransactions],
    assets: [...mockAssets],
    ledgers: [...mockLedgers],
    incomeCategories: initialCategories.incomeCategories,
    expenseCategories: initialCategories.expenseCategories,
    paymentMethods: initialCategories.paymentMethods,
    assetCategories: initialCategories.assetCategories,

    // Transactions
    addTransaction: (transaction) =>
      set((state) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `trans-${Date.now()}`,
          createdAt: new Date(),
          createdBy: mockUser.id,
        }
        return {
          transactions: [...state.transactions, newTransaction],
        }
      }),

    updateTransaction: (id, updates) =>
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates, updatedBy: mockUser.id } : t
        ),
      })),

    deleteTransaction: (id) =>
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      })),

    // Assets
    addAsset: (asset) =>
      set((state) => {
        const newAsset: Asset = {
          ...asset,
          id: `asset-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: mockUser.id,
        }
        return {
          assets: [...state.assets, newAsset],
        }
      }),

    updateAsset: (id, updates) =>
      set((state) => ({
        assets: state.assets.map((a) =>
          a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
        ),
      })),

    deleteAsset: (id) =>
      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? { ...a, isActive: false } : a)),
      })),

    // Ledgers
    addLedger: (ledger) =>
      set((state) => {
        const newLedger: Ledger = {
          ...ledger,
          id: `ledger-${Date.now()}`,
          ownerId: mockUser.id,
          members: [
            {
              userId: mockUser.id,
              email: mockUser.email,
              name: mockUser.name,
              role: 'owner',
              joinedAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        // 새 가계부의 카테고리 초기화
        return {
          ledgers: [...state.ledgers, newLedger],
          incomeCategories: {
            ...state.incomeCategories,
            [newLedger.id]: Object.fromEntries(
              Object.entries(INCOME_CATEGORIES).map(([key, value]) => [key, [...value]])
            ) as Record<string, string[]>,
          },
          expenseCategories: {
            ...state.expenseCategories,
            [newLedger.id]: Object.fromEntries(
              Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => [key, [...value]])
            ) as Record<string, string[]>,
          },
          paymentMethods: {
            ...state.paymentMethods,
            [newLedger.id]: Object.fromEntries(
              Object.entries(PAYMENT_METHODS).map(([key, value]) => [key, [...value]])
            ) as Record<string, string[]>,
          },
          assetCategories: {
            ...state.assetCategories,
            [newLedger.id]: Object.fromEntries(
              Object.entries(ASSET_CATEGORIES).map(([key, value]) => [key, [...value]])
            ) as Record<string, string[]>,
          },
        }
      }),

    updateLedger: (id, updates) =>
      set((state) => ({
        ledgers: state.ledgers.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l
        ),
      })),

    deleteLedger: (id) =>
      set((state) => {
        const { [id]: _, ...restIncome } = state.incomeCategories
        const { [id]: __, ...restExpense } = state.expenseCategories
        const { [id]: ___, ...restPayment } = state.paymentMethods
        const { [id]: ____, ...restAsset } = state.assetCategories
        return {
          ledgers: state.ledgers.filter((l) => l.id !== id),
          incomeCategories: restIncome,
          expenseCategories: restExpense,
          paymentMethods: restPayment,
          assetCategories: restAsset,
        }
      }),

    // Categories (가계부별)
    getCategories: (ledgerId, type) => {
      const state = get()
      const keyMap: Record<CategoryType, keyof MockDataState> = {
        income: 'incomeCategories',
        expense: 'expenseCategories',
        payment: 'paymentMethods',
        asset: 'assetCategories',
      }
      const key = keyMap[type]
      const categoriesByLedger = state[key] as Record<string, Record<string, string[]>>
      return categoriesByLedger[ledgerId] || {}
    },

    addCategory1: (ledgerId, type, name) =>
      set((state) => {
        const keyMap: Record<CategoryType, keyof MockDataState> = {
          income: 'incomeCategories',
          expense: 'expenseCategories',
          payment: 'paymentMethods',
          asset: 'assetCategories',
        }
        const key = keyMap[type]
        const categoriesByLedger = state[key] as Record<string, Record<string, string[]>>
        const ledgerCategories = categoriesByLedger[ledgerId] || {}
        return {
          [key]: {
            ...categoriesByLedger,
            [ledgerId]: { ...ledgerCategories, [name]: [] },
          },
        }
      }),

    updateCategory1: (ledgerId, type, oldName, newName) =>
      set((state) => {
        const keyMap: Record<CategoryType, keyof MockDataState> = {
          income: 'incomeCategories',
          expense: 'expenseCategories',
          payment: 'paymentMethods',
          asset: 'assetCategories',
        }
        const key = keyMap[type]
        const categoriesByLedger = state[key] as Record<string, Record<string, string[]>>
        const ledgerCategories = categoriesByLedger[ledgerId] || {}
        const { [oldName]: oldValue, ...rest } = ledgerCategories
        return {
          [key]: {
            ...categoriesByLedger,
            [ledgerId]: { ...rest, [newName]: oldValue || [] },
          },
        }
      }),

    deleteCategory1: (ledgerId, type, name) =>
      set((state) => {
        const keyMap: Record<CategoryType, keyof MockDataState> = {
          income: 'incomeCategories',
          expense: 'expenseCategories',
          payment: 'paymentMethods',
          asset: 'assetCategories',
        }
        const key = keyMap[type]
        const categoriesByLedger = state[key] as Record<string, Record<string, string[]>>
        const ledgerCategories = categoriesByLedger[ledgerId] || {}
        const { [name]: _, ...rest } = ledgerCategories
        return {
          [key]: {
            ...categoriesByLedger,
            [ledgerId]: rest,
          },
        }
      }),

    addCategory2: (ledgerId, type, category1, name) =>
      set((state) => {
        const keyMap: Record<CategoryType, keyof MockDataState> = {
          income: 'incomeCategories',
          expense: 'expenseCategories',
          payment: 'paymentMethods',
          asset: 'assetCategories',
        }
        const key = keyMap[type]
        const categoriesByLedger = state[key] as Record<string, Record<string, string[]>>
        const ledgerCategories = categoriesByLedger[ledgerId] || {}
        const category2List = ledgerCategories[category1] || []
        return {
          [key]: {
            ...categoriesByLedger,
            [ledgerId]: {
              ...ledgerCategories,
              [category1]: [...category2List, name],
            },
          },
        }
      }),

    updateCategory2: (ledgerId, type, category1, oldName, newName) =>
      set((state) => {
        const keyMap: Record<CategoryType, keyof MockDataState> = {
          income: 'incomeCategories',
          expense: 'expenseCategories',
          payment: 'paymentMethods',
          asset: 'assetCategories',
        }
        const key = keyMap[type]
        const categoriesByLedger = state[key] as Record<string, Record<string, string[]>>
        const ledgerCategories = categoriesByLedger[ledgerId] || {}
        const category2List = ledgerCategories[category1] || []
        const updatedList = category2List.map((item) => (item === oldName ? newName : item))
        return {
          [key]: {
            ...categoriesByLedger,
            [ledgerId]: {
              ...ledgerCategories,
              [category1]: updatedList,
            },
          },
        }
      }),

    deleteCategory2: (ledgerId, type, category1, name) =>
      set((state) => {
        const keyMap: Record<CategoryType, keyof MockDataState> = {
          income: 'incomeCategories',
          expense: 'expenseCategories',
          payment: 'paymentMethods',
          asset: 'assetCategories',
        }
        const key = keyMap[type]
        const categoriesByLedger = state[key] as Record<string, Record<string, string[]>>
        const ledgerCategories = categoriesByLedger[ledgerId] || {}
        const category2List = ledgerCategories[category1] || []
        return {
          [key]: {
            ...categoriesByLedger,
            [ledgerId]: {
              ...ledgerCategories,
              [category1]: category2List.filter((item) => item !== name),
            },
          },
        }
      }),
  }
})
