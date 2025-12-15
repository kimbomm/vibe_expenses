import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { UserPlus, Users, Mail, Crown, Trash2, X, Clock, Loader2 } from 'lucide-react'
import { useLedgerStore } from '@/entities/ledger/model/store'
import { useAuthStore } from '@/entities/user/model/store'
import { useInvitationStore } from '@/entities/invitation/model/store'
import { formatDateString } from '@/shared/lib/utils'
import { InviteMemberModal } from '@/features/member-invite'
import type { MemberRole } from '@/shared/types'

export function MembersPage() {
  const { ledgerId } = useParams()
  const { user } = useAuthStore()
  const { ledgers, fetchLedgers } = useLedgerStore()
  const {
    pendingInvitations,
    loading,
    fetchPendingInvitations,
    sendInvitation,
    cancelInvitation,
    removeMember,
    updateMemberRole,
  } = useInvitationStore()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const currentLedger = ledgers.find((l) => l.id === ledgerId)

  // 대기 초대 목록 조회
  useEffect(() => {
    if (ledgerId) {
      fetchPendingInvitations(ledgerId)
    }
  }, [ledgerId, fetchPendingInvitations])

  if (!ledgerId || !currentLedger) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">가계부를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const isOwner = currentLedger.ownerId === user?.uid
  const members = currentLedger.members || []
  const ledgerPendingInvitations = pendingInvitations[ledgerId] || []

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

  const getRoleDescription = (role: MemberRole) => {
    switch (role) {
      case 'owner':
        return '모든 권한'
      case 'editor':
        return '거래/자산 추가, 수정, 삭제'
      case 'viewer':
        return '조회만 가능'
    }
  }

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    try {
      await updateMemberRole(ledgerId, memberId, newRole)
      // 가계부 목록 새로고침 (멤버 정보 업데이트 반영)
      if (user?.uid) {
        await fetchLedgers(user.uid)
      }
    } catch (error) {
      alert('권한 변경에 실패했습니다.')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('정말 이 멤버를 제거하시겠습니까?')) return

    try {
      await removeMember(ledgerId, memberId)
      // 가계부 목록 새로고침 (멤버 정보 업데이트 반영)
      if (user?.uid) {
        await fetchLedgers(user.uid)
      }
    } catch (error) {
      alert('멤버 제거에 실패했습니다.')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('정말 이 초대를 취소하시겠습니까?')) return

    try {
      await cancelInvitation(invitationId, ledgerId)
    } catch (error) {
      alert('초대 취소에 실패했습니다.')
    }
  }

  const handleInvite = async (email: string, role: MemberRole) => {
    if (!user) return

    // 이미 멤버인지 확인
    const existingMember = members.find((m) => m.email.toLowerCase() === email.toLowerCase())
    if (existingMember) {
      alert('이미 가계부 멤버입니다.')
      return
    }

    try {
      await sendInvitation(
        ledgerId,
        currentLedger.name,
        email,
        role,
        user.uid,
        user.displayName || user.email || '알 수 없음'
      )
      setInviteModalOpen(false)
    } catch (error: any) {
      alert(error.message || '초대 전송에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">멤버 관리</h1>
          <p className="mt-1 text-muted-foreground">{currentLedger.name}의 멤버를 관리하세요</p>
        </div>
        {isOwner && (
          <Button size="lg" onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-5 w-5" />
            멤버 초대
          </Button>
        )}
      </div>

      {/* 현재 멤버 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            현재 멤버 ({members.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {member.role === 'owner' ? (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <span className="text-sm font-medium text-primary">
                      {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name || '이름 없음'}</span>
                    {member.userId === user?.uid && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        나
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.role === 'owner' ? (
                  <div className="flex items-center gap-1 rounded-md bg-yellow-100 px-3 py-1.5 text-sm font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Crown className="h-4 w-4" />
                    Owner
                  </div>
                ) : isOwner ? (
                  <>
                    <Select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.userId, e.target.value as MemberRole)
                      }
                      className="w-[120px]"
                      disabled={loading}
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
                    {getRoleLabel(member.role)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">멤버가 없습니다.</div>
          )}
        </CardContent>
      </Card>

      {/* 대기 중인 초대 (Owner만 표시) */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              대기 중인 초대 ({ledgerPendingInvitations.length}명)
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ledgerPendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      초대일: {formatDateString(invitation.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
                    {getRoleLabel(invitation.role)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleCancelInvitation(invitation.id)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {ledgerPendingInvitations.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                대기 중인 초대가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 권한 설명 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">권한 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium text-yellow-600">Owner:</span>
              <span className="text-muted-foreground">{getRoleDescription('owner')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-primary">Editor:</span>
              <span className="text-muted-foreground">{getRoleDescription('editor')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-muted-foreground">Viewer:</span>
              <span className="text-muted-foreground">{getRoleDescription('viewer')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 초대 모달 */}
      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onInvite={handleInvite}
        ledgerName={currentLedger.name}
      />
    </div>
  )
}
