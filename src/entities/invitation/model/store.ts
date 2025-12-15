import { create } from 'zustand'
import type { Invitation, MemberRole } from './types'
import {
  getInvitationsByEmail,
  getPendingInvitationsByLedger,
  getPendingInvitationCount,
  createInvitation,
  acceptInvitation as acceptInvitationApi,
  rejectInvitation as rejectInvitationApi,
  cancelInvitation as cancelInvitationApi,
  removeMemberFromLedger,
  updateMemberRole as updateMemberRoleApi,
} from '../api/invitationApi'

interface InvitationState {
  // 받은 초대 목록
  receivedInvitations: Invitation[]
  // 특정 가계부의 대기 중인 초대 목록
  pendingInvitations: Record<string, Invitation[]>
  // 대기 초대 개수
  pendingCount: number
  // 로딩 상태
  loading: boolean
  error: string | null

  // 받은 초대 조회
  fetchReceivedInvitations: (email: string) => Promise<void>
  // 특정 가계부의 대기 초대 조회
  fetchPendingInvitations: (ledgerId: string) => Promise<void>
  // 대기 초대 개수 조회
  fetchPendingCount: (email: string) => Promise<void>

  // 초대 생성
  sendInvitation: (
    ledgerId: string,
    ledgerName: string,
    email: string,
    role: MemberRole,
    invitedBy: string,
    invitedByName: string
  ) => Promise<void>

  // 초대 수락
  acceptInvitation: (
    invitationId: string,
    userId: string,
    userName: string,
    email: string
  ) => Promise<void>
  // 초대 거절
  rejectInvitation: (invitationId: string, email: string) => Promise<void>
  // 초대 취소
  cancelInvitation: (invitationId: string, ledgerId: string) => Promise<void>

  // 멤버 관리
  removeMember: (ledgerId: string, memberUserId: string) => Promise<void>
  updateMemberRole: (ledgerId: string, memberUserId: string, newRole: MemberRole) => Promise<void>

  // 상태 초기화
  reset: () => void
}

export const useInvitationStore = create<InvitationState>((set, get) => ({
  receivedInvitations: [],
  pendingInvitations: {},
  pendingCount: 0,
  loading: false,
  error: null,

  fetchReceivedInvitations: async (email: string) => {
    set({ loading: true, error: null })
    try {
      const invitations = await getInvitationsByEmail(email)
      set({ receivedInvitations: invitations, loading: false })
    } catch (error) {
      console.error('받은 초대 조회 실패:', error)
      set({ error: '초대 목록을 불러오는데 실패했습니다.', loading: false })
    }
  },

  fetchPendingInvitations: async (ledgerId: string) => {
    set({ loading: true, error: null })
    try {
      const invitations = await getPendingInvitationsByLedger(ledgerId)
      set((state) => ({
        pendingInvitations: {
          ...state.pendingInvitations,
          [ledgerId]: invitations,
        },
        loading: false,
      }))
    } catch (error) {
      console.error('대기 초대 조회 실패:', error)
      set({ error: '초대 목록을 불러오는데 실패했습니다.', loading: false })
    }
  },

  fetchPendingCount: async (email: string) => {
    try {
      const count = await getPendingInvitationCount(email)
      set({ pendingCount: count })
    } catch (error) {
      console.error('대기 초대 개수 조회 실패:', error)
    }
  },

  sendInvitation: async (ledgerId, ledgerName, email, role, invitedBy, invitedByName) => {
    set({ loading: true, error: null })
    try {
      await createInvitation(ledgerId, ledgerName, email, role, invitedBy, invitedByName)
      // 대기 초대 목록 새로고침
      await get().fetchPendingInvitations(ledgerId)
      set({ loading: false })
    } catch (error: any) {
      console.error('초대 전송 실패:', error)
      set({ error: error.message || '초대 전송에 실패했습니다.', loading: false })
      throw error
    }
  },

  acceptInvitation: async (invitationId, userId, userName, email) => {
    set({ loading: true, error: null })
    try {
      await acceptInvitationApi(invitationId, userId, userName)
      // 받은 초대 목록 새로고침
      await get().fetchReceivedInvitations(email)
      await get().fetchPendingCount(email)
      set({ loading: false })
    } catch (error: any) {
      console.error('초대 수락 실패:', error)
      set({ error: error.message || '초대 수락에 실패했습니다.', loading: false })
      throw error
    }
  },

  rejectInvitation: async (invitationId, email) => {
    set({ loading: true, error: null })
    try {
      await rejectInvitationApi(invitationId)
      // 받은 초대 목록 새로고침
      await get().fetchReceivedInvitations(email)
      await get().fetchPendingCount(email)
      set({ loading: false })
    } catch (error: any) {
      console.error('초대 거절 실패:', error)
      set({ error: error.message || '초대 거절에 실패했습니다.', loading: false })
      throw error
    }
  },

  cancelInvitation: async (invitationId, ledgerId) => {
    set({ loading: true, error: null })
    try {
      await cancelInvitationApi(invitationId)
      // 대기 초대 목록 새로고침
      await get().fetchPendingInvitations(ledgerId)
      set({ loading: false })
    } catch (error: any) {
      console.error('초대 취소 실패:', error)
      set({ error: error.message || '초대 취소에 실패했습니다.', loading: false })
      throw error
    }
  },

  removeMember: async (ledgerId, memberUserId) => {
    set({ loading: true, error: null })
    try {
      await removeMemberFromLedger(ledgerId, memberUserId)
      set({ loading: false })
    } catch (error: any) {
      console.error('멤버 제거 실패:', error)
      set({ error: error.message || '멤버 제거에 실패했습니다.', loading: false })
      throw error
    }
  },

  updateMemberRole: async (ledgerId, memberUserId, newRole) => {
    set({ loading: true, error: null })
    try {
      await updateMemberRoleApi(ledgerId, memberUserId, newRole)
      set({ loading: false })
    } catch (error: any) {
      console.error('권한 변경 실패:', error)
      set({ error: error.message || '권한 변경에 실패했습니다.', loading: false })
      throw error
    }
  },

  reset: () => {
    set({
      receivedInvitations: [],
      pendingInvitations: {},
      pendingCount: 0,
      loading: false,
      error: null,
    })
  },
}))

