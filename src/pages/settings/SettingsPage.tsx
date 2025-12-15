import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/entities/user/model/store'
import { useInvitationStore } from '@/entities/invitation/model/store'
import { formatDateString } from '@/shared/lib/utils'
import { User, Mail, ChevronRight } from 'lucide-react'

export function SettingsPage() {
  const { user } = useAuthStore()
  const { pendingCount } = useInvitationStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="mt-1 text-muted-foreground">계정 및 앱 설정</p>
      </div>

      {/* 받은 초대 */}
      <Link to="/invitations">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">받은 초대</h4>
                <p className="text-sm text-muted-foreground">
                  다른 가계부에서 보낸 초대를 확인하세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
                  {pendingCount}
                </span>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 프로필 */}
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>계정 정보를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || '프로필'}
                className="h-16 w-16 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full bg-muted ${user?.photoURL ? 'hidden' : ''}`}
            >
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{user?.displayName || '사용자'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
            </div>
          </div>
          {user?.metadata?.creationTime && (
            <div className="text-sm text-muted-foreground">
              가입일: {formatDateString(new Date(user.metadata.creationTime))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 앱 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>앱 설정</CardTitle>
          <CardDescription>알림 및 표시 설정</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">다크 모드</h4>
              <p className="text-sm text-muted-foreground">테마를 변경합니다</p>
            </div>
            <Button variant="outline">변경</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">통화 설정</h4>
              <p className="text-sm text-muted-foreground">기본 통화: KRW</p>
            </div>
            <Button variant="outline">변경</Button>
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 */}
      <Card>
        <CardHeader>
          <CardTitle>계정 관리</CardTitle>
          <CardDescription>계정 관련 작업</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            데이터 내보내기
          </Button>
          <Button variant="destructive" className="w-full justify-start">
            계정 삭제
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
