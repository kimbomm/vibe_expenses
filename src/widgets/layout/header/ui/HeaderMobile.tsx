import { useEffect, useMemo } from 'react'
import { Menu, LogOut, Mail, Search } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/entities/user/model/store'
import { useInvitationStore } from '@/entities/invitation/model/store'
import { useLedgerStore } from '@/entities/ledger/model/store'

interface HeaderMobileProps {
  onMenuClick?: () => void
}

export function HeaderMobile({ onMenuClick }: HeaderMobileProps) {
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
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <button
            onClick={handleLogoClick}
            className="text-xl font-bold text-primary transition-opacity hover:opacity-80"
          >
            Vibe
          </button>
        </div>

        <div className="flex items-center gap-2">
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
