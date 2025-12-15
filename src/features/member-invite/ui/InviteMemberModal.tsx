import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { Mail, UserPlus } from 'lucide-react'
import type { MemberRole } from '@/shared/types'

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (email: string, role: MemberRole) => void
  ledgerName: string
}

export function InviteMemberModal({
  open,
  onOpenChange,
  onInvite,
  ledgerName,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberRole>('editor')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 이메일 유효성 검사
    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 형식이 아닙니다.')
      return
    }

    onInvite(email.trim(), role)

    // 폼 초기화
    setEmail('')
    setRole('editor')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // 모달 닫을 때 폼 초기화
      setEmail('')
      setRole('editor')
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            멤버 초대
          </DialogTitle>
          <DialogDescription>"{ledgerName}"에 새로운 멤버를 초대합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className="pl-10"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">권한</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as MemberRole)}>
              <option value="editor">Editor - 거래/자산 추가, 수정, 삭제</option>
              <option value="viewer">Viewer - 조회만 가능</option>
            </Select>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p>초대받은 사용자가 해당 이메일로 로그인하면 초대를 확인할 수 있습니다.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">
              <Mail className="mr-2 h-4 w-4" />
              초대 보내기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
