import { useEffect } from 'react'
import { Menu, LogOut, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useInvitationStore } from '@/stores/invitationStore'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const { pendingCount, fetchPendingCount } = useInvitationStore()

  // 대기 초대 개수 조회
  useEffect(() => {
    if (user?.email) {
      fetchPendingCount(user.email)
    }
  }, [user?.email, fetchPendingCount])

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/ledgers" className="text-xl font-bold text-primary">
            Vibe
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <>
              {/* 초대 아이콘 */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/invitations')}
                title="받은 초대"
              >
                <Mail className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Button>

              <div className="hidden items-center gap-2 md:flex">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      // 이미지 로드 실패 시 기본 아바타로 대체
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent && !parent.querySelector('.avatar-fallback')) {
                        const fallback = document.createElement('div')
                        fallback.className =
                          'avatar-fallback flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium'
                        fallback.textContent =
                          user.displayName?.[0]?.toUpperCase() ||
                          user.email?.[0]?.toUpperCase() ||
                          'U'
                        parent.insertBefore(fallback, target)
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium">{user.displayName || user.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="로그아웃">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
