import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockUser } from '@/lib/mocks/mockData'
import { formatDateString } from '@/lib/utils'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground mt-1">계정 및 앱 설정</p>
      </div>

      {/* 프로필 */}
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>계정 정보를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={mockUser.profileImage}
              alt={mockUser.name}
              className="h-16 w-16 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{mockUser.name}</h3>
              <p className="text-muted-foreground text-sm">{mockUser.email}</p>
            </div>
          </div>
          <div className="text-muted-foreground text-sm">
            가입일: {formatDateString(mockUser.createdAt)}
          </div>
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
              <p className="text-muted-foreground text-sm">테마를 변경합니다</p>
            </div>
            <Button variant="outline">변경</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">통화 설정</h4>
              <p className="text-muted-foreground text-sm">기본 통화: KRW</p>
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
