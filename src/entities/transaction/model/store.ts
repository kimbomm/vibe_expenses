import { create } from 'zustand'
import {
  createTransaction,
  updateTransactionById,
  deleteTransactionById,
  getTransactionsByLedger,
  getTransactionsByLedgerAndMonth,
  getTransactionsByLedgerAndMonths,
} from '../api/transactionApi'
import {
  encryptTransaction,
  encryptTransactionUpdate,
  decryptTransactions,
} from '../lib/transactionCrypto'
import { useLedgerStore } from '@/entities/ledger/model/store'
import type { Transaction } from './types'

interface TransactionState {
  transactions: Record<string, Transaction[]> // ledgerId -> transactions[]
  loading: Record<string, boolean>
  error: string | null
  lastFetched: Record<string, number> // ledgerId -> timestamp

  // Actions
  fetchTransactions: (ledgerId: string) => Promise<void>
  fetchTransactionsByMonth: (ledgerId: string, year: number, month: number) => Promise<void>
  fetchTransactionsByMonths: (ledgerId: string, monthKeys: string[]) => Promise<void>
  addTransaction: (
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>,
    userId: string
  ) => Promise<string>
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>,
    userId: string
  ) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

// 가계부의 암호화 키 가져오기
function getEncryptionKey(ledgerId: string): string | undefined {
  const ledgers = useLedgerStore.getState().ledgers
  const ledger = ledgers.find((l) => l.id === ledgerId)
  return ledger?.encryptionKey
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: {},
  loading: {},
  error: null,
  lastFetched: {},

  // 거래내역 조회 (최근 12개월)
  fetchTransactions: async (ledgerId: string) => {
    if (!ledgerId) return

    // 이미 로딩 중이면 스킵
    const { loading } = get()
    if (loading[ledgerId]) return

    set((state) => ({
      loading: { ...state.loading, [ledgerId]: true },
      error: null,
    }))

    try {
      let transactions = await getTransactionsByLedger(ledgerId)

      // 복호화
      const encryptionKey = getEncryptionKey(ledgerId)
      if (encryptionKey) {
        transactions = await decryptTransactions(transactions, encryptionKey)
      }

      set((state) => ({
        transactions: { ...state.transactions, [ledgerId]: transactions },
        loading: { ...state.loading, [ledgerId]: false },
        lastFetched: { ...state.lastFetched, [ledgerId]: Date.now() },
        error: null,
      }))
    } catch (error) {
      console.error('거래내역 조회 실패:', error)
      set((state) => ({
        loading: { ...state.loading, [ledgerId]: false },
        error: error instanceof Error ? error.message : '거래내역 조회 실패',
      }))
    }
  },

  // 특정 월의 거래내역 조회
  fetchTransactionsByMonth: async (ledgerId: string, year: number, month: number) => {
    if (!ledgerId) return

    const loadingKey = `${ledgerId}_${year}-${month}`
    const { loading } = get()
    if (loading[loadingKey]) return

    set((state) => ({
      loading: { ...state.loading, [loadingKey]: true },
      error: null,
    }))

    try {
      let monthTransactions = await getTransactionsByLedgerAndMonth(ledgerId, year, month)

      // 복호화
      const encryptionKey = getEncryptionKey(ledgerId)
      if (encryptionKey) {
        monthTransactions = await decryptTransactions(monthTransactions, encryptionKey)
      }

      // 기존 거래내역과 병합 (같은 월의 거래는 교체)
      set((state) => {
        const existing = state.transactions[ledgerId] || []
        const otherMonths = existing.filter(
          (t) => t.date.getFullYear() !== year || t.date.getMonth() !== month - 1
        )
        const merged = [...otherMonths, ...monthTransactions].sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        )

        return {
          transactions: { ...state.transactions, [ledgerId]: merged },
          loading: { ...state.loading, [loadingKey]: false },
          lastFetched: { ...state.lastFetched, [ledgerId]: Date.now() },
          error: null,
        }
      })
    } catch (error) {
      console.error('거래내역 조회 실패:', error)
      set((state) => ({
        loading: { ...state.loading, [loadingKey]: false },
        error: error instanceof Error ? error.message : '거래내역 조회 실패',
      }))
    }
  },

  // 여러 월의 거래내역 조회
  fetchTransactionsByMonths: async (ledgerId: string, monthKeys: string[]) => {
    if (!ledgerId || monthKeys.length === 0) return

    const loadingKey = `${ledgerId}_${monthKeys.join(',')}`
    const { loading } = get()
    if (loading[loadingKey]) return

    set((state) => ({
      loading: { ...state.loading, [loadingKey]: true },
      error: null,
    }))

    try {
      let transactions = await getTransactionsByLedgerAndMonths(ledgerId, monthKeys)

      // 복호화
      const encryptionKey = getEncryptionKey(ledgerId)
      if (encryptionKey) {
        transactions = await decryptTransactions(transactions, encryptionKey)
      }

      set((state) => ({
        transactions: { ...state.transactions, [ledgerId]: transactions },
        loading: { ...state.loading, [loadingKey]: false },
        lastFetched: { ...state.lastFetched, [ledgerId]: Date.now() },
        error: null,
      }))
    } catch (error) {
      console.error('거래내역 조회 실패:', error)
      set((state) => ({
        loading: { ...state.loading, [loadingKey]: false },
        error: error instanceof Error ? error.message : '거래내역 조회 실패',
      }))
    }
  },

  // 거래내역 추가
  addTransaction: async (transaction, userId) => {
    try {
      console.log('거래내역 생성 시작:', { transaction, userId })

      // 암호화
      const encryptionKey = getEncryptionKey(transaction.ledgerId)
      const dataToSave = encryptionKey
        ? await encryptTransaction(transaction, encryptionKey)
        : transaction

      const transactionId = await createTransaction(dataToSave, userId)
      console.log('거래내역 생성 완료:', transactionId)

      // 생성 후 해당 월의 거래내역 다시 조회
      const date = transaction.date instanceof Date ? transaction.date : new Date(transaction.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      await get().fetchTransactionsByMonth(transaction.ledgerId, year, month)

      return transactionId
    } catch (error) {
      console.error('거래내역 생성 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '거래내역 생성 실패'
      set({ error: errorMessage })
      throw error
    }
  },

  // 거래내역 수정
  updateTransaction: async (id, updates, userId) => {
    try {
      // ledgerId 찾기
      const { transactions } = get()
      const ledgerId = Object.keys(transactions).find((lid) =>
        transactions[lid]?.some((t) => t.id === id)
      )

      if (!ledgerId) {
        throw new Error('Ledger ID not found for transaction update')
      }

      // 암호화
      const encryptionKey = getEncryptionKey(ledgerId)
      const dataToSave = encryptionKey
        ? await encryptTransactionUpdate(updates, encryptionKey)
        : updates

      await updateTransactionById(ledgerId, id, dataToSave, userId)

      // 날짜가 변경되었을 수 있으므로, 관련 월들을 다시 조회
      const transaction = transactions[ledgerId]?.find((t) => t.id === id)
      if (transaction) {
        const oldDate = transaction.date
        const newDate = updates.date
          ? updates.date instanceof Date
            ? updates.date
            : new Date(updates.date)
          : oldDate

        const oldMonthKey = `${oldDate.getFullYear()}-${String(oldDate.getMonth() + 1).padStart(2, '0')}`
        const newMonthKey = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`

        const monthsToFetch = new Set([oldMonthKey, newMonthKey])
        await get().fetchTransactionsByMonths(ledgerId, Array.from(monthsToFetch))
      } else {
        // 거래를 찾을 수 없으면 전체 조회
        await get().fetchTransactions(ledgerId)
      }
    } catch (error) {
      console.error('거래내역 수정 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '거래내역 수정 실패'
      set({ error: errorMessage })
      throw error
    }
  },

  // 거래내역 삭제
  deleteTransaction: async (id) => {
    try {
      // 삭제 전에 ledgerId와 날짜 찾기
      const { transactions } = get()
      const ledgerId = Object.keys(transactions).find((lid) =>
        transactions[lid]?.some((t) => t.id === id)
      )

      if (!ledgerId) {
        throw new Error('Ledger ID not found for transaction deletion')
      }

      const transaction = transactions[ledgerId]?.find((t) => t.id === id)
      const monthKey = transaction
        ? `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`
        : null

      await deleteTransactionById(ledgerId, id)

      // 삭제 후 해당 월의 거래내역 다시 조회
      if (monthKey) {
        const [year, month] = monthKey.split('-').map(Number)
        await get().fetchTransactionsByMonth(ledgerId, year, month)
      } else {
        await get().fetchTransactions(ledgerId)
      }
    } catch (error) {
      console.error('거래내역 삭제 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '거래내역 삭제 실패'
      set({ error: errorMessage })
      throw error
    }
  },
}))

