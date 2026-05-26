import { useEffect, useMemo } from 'react'
import { LogOut, Mail, Search } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/entities/user/model/store'
import { useInvitationStore } from '@/entities/invitation/model/store'
import { useLedgerStore } from '@/entities/ledger/model/store'

export function HeaderDesktop() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { pendingCount, fetchPendingCount } = useInvitationStore()
  const { ledgers } = useLedgerStore()

  const currentLedgerId = useMemo(() => {
    const ledgerIdFromPath = location.pathname.match(/\/ledgers\/([^/]+)/)?.[1]
    const lastLedgerId = typeof window !== 'undefined' ? localStorage.getItem('lastLedgerId') : null
    return ledgerIdFromPath || lastLedgerId || ledgers[0]?.id || null
  }, [location.pathname, ledgers])

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

  const handleLogoClick = () => {
    if (currentLedgerId) {
      navigate(`/ledgers/${currentLedgerId}/dashboard`)
    } else if (ledgers.length > 0) {
      navigate(`/ledgers/${ledgers[0].id}/dashboard`)
    } else {
      navigate('/ledgers')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <button
          onClick={handleLogoClick}
          className="text-xl font-bold text-primary transition-opacity hover:opacity-80"
        >
          Vibe
        </button>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/invitations')}
                title="받은 초대"
              >
                <Mail className="h-5 w-5" />
                {pendingCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                ) : null}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigate(`/search${currentLedgerId ? `?ledgerId=${currentLedgerId}` : ''}`)
                }
                title="거래 검색"
              >
                <Search className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full object-cover"
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
          ) : null}
        </div>
      </div>
    </header>
  )
}
