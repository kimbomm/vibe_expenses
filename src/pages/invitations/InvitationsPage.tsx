import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Check, X, Clock, CheckCircle, XCircle, Users, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useInvitationStore } from '@/stores/invitationStore'
import { useLedgerStore } from '@/stores/ledgerStore'
import { formatDateString } from '@/lib/utils'
import type { MemberRole } from '@/types'

export function InvitationsPage() {
  const { user } = useAuthStore()
  const { fetchLedgers } = useLedgerStore()
  const {
    receivedInvitations,
    loading,
    fetchReceivedInvitations,
    fetchPendingCount,
    acceptInvitation,
    rejectInvitation,
  } = useInvitationStore()

  // 받은 초대 목록 조회
  useEffect(() => {
    if (user?.email) {
      fetchReceivedInvitations(user.email)
    }
  }, [user?.email, fetchReceivedInvitations])

  const pendingInvitations = receivedInvitations.filter((inv) => inv.status === 'pending')
  const pastInvitations = receivedInvitations.filter((inv) => inv.status !== 'pending').slice(0, 5) // 최대 5개만 표시

  const getRoleLabel = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'editor':
        return 'Editor'
      case 'viewer':
        return 'Viewer'
    }
  }

  const handleAccept = async (invitationId: string) => {
    if (!user?.email || !user?.uid) return

    try {
      await acceptInvitation(invitationId, user.uid, user.displayName || user.email, user.email)
      // 가계부 목록 새로고침 (새 멤버로 추가된 가계부 반영)
      await fetchLedgers(user.uid)
    } catch (error) {
      alert('초대 수락에 실패했습니다.')
    }
  }

  const handleReject = async (invitationId: string) => {
    if (!user?.email) return
    if (!confirm('정말 이 초대를 거절하시겠습니까?')) return

    try {
      await rejectInvitation(invitationId, user.email)
    } catch (error) {
      alert('초대 거절에 실패했습니다.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">받은 초대</h1>
        <p className="mt-1 text-muted-foreground">다른 가계부에서 보낸 초대를 확인하세요</p>
      </div>

      {/* 대기 중인 초대 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            대기 중인 초대 ({pendingInvitations.length}건)
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingInvitations.length > 0 ? (
            pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{invitation.ledgerName}</h3>
                      <p className="text-sm text-muted-foreground">
                        초대자: {invitation.invitedByName}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                          {getRoleLabel(invitation.role)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateString(invitation.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleReject(invitation.id)}
                      disabled={loading}
                    >
                      <X className="mr-1 h-4 w-4" />
                      거절
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleAccept(invitation.id)}
                      disabled={loading}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      수락
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-muted-foreground">대기 중인 초대가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 지난 초대 */}
      {pastInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              지난 초대
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {invitation.status === 'accepted' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{invitation.ledgerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {invitation.status === 'accepted' ? '수락됨' : '거절됨'} ·{' '}
                      {invitation.respondedAt && formatDateString(invitation.respondedAt)}
                    </p>
                  </div>
                </div>
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                  {getRoleLabel(invitation.role)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
