import { create } from 'zustand'
import { collection, query, where, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { createLedger, updateLedgerById, deleteLedgerById } from '@/lib/firebase/ledgers'
import type { Ledger, Member } from '@/types'
import type { Timestamp } from 'firebase/firestore'

interface LedgerState {
  ledgers: Ledger[]
  loading: boolean
  error: string | null
  unsubscribe: Unsubscribe | null

  // Actions
  subscribeLedgers: (userId: string) => void
  unsubscribeLedgers: () => void
  addLedger: (
    ledger: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>,
    ownerId: string,
    ownerEmail: string,
    ownerName: string
  ) => Promise<string>
  updateLedger: (id: string, ledger: Partial<Ledger>) => Promise<void>
  deleteLedger: (id: string) => Promise<void>
}

// Firestore의 Timestamp를 Date로 변환
function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  return timestamp.toDate()
}

// Firestore의 Member 배열을 변환
function convertMembers(members: any[]): Member[] {
  return members.map((m) => ({
    userId: m.userId,
    email: m.email,
    name: m.name,
    role: m.role,
    joinedAt: timestampToDate(m.joinedAt),
  }))
}

// Firestore 문서를 Ledger 타입으로 변환
function convertFirestoreLedger(docId: string, data: any): Ledger {
  return {
    id: docId,
    name: data.name,
    description: data.description || '',
    currency: data.currency,
    ownerId: data.ownerId,
    members: convertMembers(data.members || []),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  }
}

export const useLedgerStore = create<LedgerState>((set, get) => {
  return {
    ledgers: [],
    loading: false,
    error: null,
    unsubscribe: null,

    // 실시간 가계부 구독
    subscribeLedgers: (userId: string) => {
      // 기존 구독 해제
      const { unsubscribe: prevUnsubscribe } = get()
      if (prevUnsubscribe) {
        prevUnsubscribe()
      }

      set({ loading: true, error: null })

      try {
        const ledgersRef = collection(db, 'ledgers')
        // 현재는 ownerId 기준으로만 구독
        const q = query(ledgersRef, where('ownerId', '==', userId))

        let isFirstSnapshot = true

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const ledgers: Ledger[] = []
            snapshot.forEach((doc) => {
              ledgers.push(convertFirestoreLedger(doc.id, doc.data()))
            })

            console.log('가계부 구독 업데이트:', {
              count: ledgers.length,
              ledgerIds: ledgers.map((l) => l.id),
              isFirstSnapshot,
            })

            // 첫 번째 스냅샷에서만 loading을 false로 설정
            // 이후 업데이트는 실시간으로 반영되므로 loading 상태 변경 불필요
            if (isFirstSnapshot) {
              set({ ledgers, loading: false, error: null })
              isFirstSnapshot = false
            } else {
              set({ ledgers, error: null })
            }
          },
          (error) => {
            console.error('가계부 구독 오류:', error)
            set({ loading: false, error: error.message })
          }
        )

        set({ unsubscribe })
      } catch (error) {
        console.error('가계부 구독 실패:', error)
        set({ loading: false, error: error instanceof Error ? error.message : '알 수 없는 오류' })
      }
    },

    // 구독 해제
    unsubscribeLedgers: () => {
      const { unsubscribe } = get()
      if (unsubscribe) {
        unsubscribe()
        set({ unsubscribe: null })
      }
    },

    // 가계부 추가
    addLedger: async (ledger, ownerId, ownerEmail, ownerName) => {
      try {
        console.log('가계부 생성 시작:', { ledger, ownerId })
        const ledgerId = await createLedger(ledger, ownerId, ownerEmail, ownerName)
        console.log('가계부 생성 완료:', ledgerId)
        // 실시간 구독(onSnapshot)이 자동으로 업데이트하므로 별도 상태 업데이트 불필요
        // loading 상태는 변경하지 않음 (실시간 구독이 처리)
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
        // 실시간 구독이 자동으로 업데이트하므로 별도 상태 업데이트 불필요
        set({ loading: false })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '가계부 수정 실패'
        set({ loading: false, error: errorMessage })
        throw error
      }
    },

    // 가계부 삭제
    deleteLedger: async (id) => {
      try {
        set({ loading: true, error: null })
        await deleteLedgerById(id)
        // 실시간 구독이 자동으로 업데이트하므로 별도 상태 업데이트 불필요
        set({ loading: false })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '가계부 삭제 실패'
        set({ loading: false, error: errorMessage })
        throw error
      }
    },
  }
})
