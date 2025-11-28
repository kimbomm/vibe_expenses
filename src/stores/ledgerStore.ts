import { create } from 'zustand'
import {
  createLedger,
  updateLedgerById,
  deleteLedgerById,
  getLedgersByUser,
} from '@/lib/firebase/ledgers'
import type { Ledger } from '@/types'

interface LedgerState {
  ledgers: Ledger[]
  loading: boolean
  error: string | null
  lastFetched: number | null // timestamp

  // Actions
  fetchLedgers: (userId: string) => Promise<void>
  addLedger: (
    ledger: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>,
    ownerId: string,
    ownerEmail: string,
    ownerName: string
  ) => Promise<string>
  updateLedger: (id: string, ledger: Partial<Ledger>) => Promise<void>
  deleteLedger: (id: string, userId: string) => Promise<void>
}

export const useLedgerStore = create<LedgerState>((set, get) => {
  return {
    ledgers: [],
    loading: false,
    error: null,
    lastFetched: null,

    // 가계부 조회 (주기적 폴링)
    fetchLedgers: async (userId: string) => {
      // 이미 로딩 중이면 스킵
      const { loading } = get()
      if (loading) return

      set({ loading: true, error: null })

      try {
        const ledgers = await getLedgersByUser(userId)
        set({ ledgers, loading: false, error: null, lastFetched: Date.now() })
      } catch (error) {
        console.error('가계부 조회 실패:', error)
        set({ loading: false, error: error instanceof Error ? error.message : '알 수 없는 오류' })
      }
    },

    // 가계부 추가
    addLedger: async (ledger, ownerId, ownerEmail, ownerName) => {
      try {
        console.log('가계부 생성 시작:', { ledger, ownerId })
        const ledgerId = await createLedger(ledger, ownerId, ownerEmail, ownerName)
        console.log('가계부 생성 완료:', ledgerId)
        // 생성 후 가계부 목록 다시 조회
        await get().fetchLedgers(ownerId)
        return ledgerId
      } catch (error) {
        console.error('가계부 생성 실패:', error)
        const errorMessage = error instanceof Error ? error.message : '가계부 생성 실패'
        set({ error: errorMessage })
        throw error
      }
    },

    // 가계부 수정
    updateLedger: async (id, updates) => {
      try {
        set({ loading: true, error: null })
        await updateLedgerById(id, updates)
        // 수정 후 가계부 목록 다시 조회 (ownerId 찾기)
        const { ledgers } = get()
        const ledger = ledgers.find((l) => l.id === id)
        if (ledger) {
          await get().fetchLedgers(ledger.ownerId)
        } else {
          set({ loading: false })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '가계부 수정 실패'
        set({ loading: false, error: errorMessage })
        throw error
      }
    },

    // 가계부 삭제
    deleteLedger: async (id, userId) => {
      try {
        await deleteLedgerById(id)
        // 삭제 후 현재 사용자의 가계부 목록 다시 조회
        // fetchLedgers가 자동으로 loading 상태를 관리하므로 여기서는 설정하지 않음
        await get().fetchLedgers(userId)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '가계부 삭제 실패'
        set({ error: errorMessage })
        throw error
      }
    },
  }
})
