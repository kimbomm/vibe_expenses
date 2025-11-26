import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  // Popup 방식이므로 redirect 결과 확인 불필요
  // onAuthStateChanged가 자동으로 인증 상태를 관리함

  // 로딩 중일 때는 아무것도 렌더링하지 않음
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
