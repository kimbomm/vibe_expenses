import { useLedgerStore } from '@/entities/ledger/model/store'
import { useAuthStore } from '@/entities/user/model/store'
import type { MemberRole } from '@/shared/types'

interface LedgerPermission {
  role: MemberRole | null
  isOwner: boolean
  isEditor: boolean
  isViewer: boolean
  canEdit: boolean // owner 또는 editor
  canView: boolean // 모든 멤버
}

export function useLedgerPermission(ledgerId: string | undefined): LedgerPermission {
  const { user } = useAuthStore()
  const { ledgers } = useLedgerStore()

  if (!ledgerId || !user?.uid) {
    return {
      role: null,
      isOwner: false,
      isEditor: false,
      isViewer: false,
      canEdit: false,
      canView: false,
    }
  }

  const ledger = ledgers.find((l) => l.id === ledgerId)
  if (!ledger) {
    return {
      role: null,
      isOwner: false,
      isEditor: false,
      isViewer: false,
      canEdit: false,
      canView: false,
    }
  }

  const member = ledger.members.find((m) => m.userId === user.uid)
  const role = member?.role || null

  const isOwner = role === 'owner'
  const isEditor = role === 'editor'
  const isViewer = role === 'viewer'

  return {
    role,
    isOwner,
    isEditor,
    isViewer,
    canEdit: isOwner || isEditor,
    canView: isOwner || isEditor || isViewer,
  }
}

