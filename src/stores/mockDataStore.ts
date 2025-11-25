import { create } from 'zustand'
import type { Transaction, Asset, Ledger } from '@/types'
import { mockTransactions, mockAssets, mockLedgers, mockUser } from '@/lib/mocks/mockData'

interface MockDataState {
  // Data
  transactions: Transaction[]
  assets: Asset[]
  ledgers: Ledger[]

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
}

export const useMockDataStore = create<MockDataState>((set) => ({
  // Initial state
  transactions: [...mockTransactions],
  assets: [...mockAssets],
  ledgers: [...mockLedgers],

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
      return {
        ledgers: [...state.ledgers, newLedger],
      }
    }),

  updateLedger: (id, updates) =>
    set((state) => ({
      ledgers: state.ledgers.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date() } : l
      ),
    })),

  deleteLedger: (id) =>
    set((state) => ({
      ledgers: state.ledgers.filter((l) => l.id !== id),
    })),
}))
