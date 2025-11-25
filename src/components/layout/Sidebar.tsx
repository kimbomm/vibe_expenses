import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ArrowRightLeft,
  Wallet,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { mockLedgers } from '@/lib/mocks/mockData'

const navigation = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '가계부',
    href: '/ledgers',
    icon: BookOpen,
  },
]

const getLedgerNavigation = (ledgerId: string) => [
  {
    name: '거래 내역',
    href: `/ledgers/${ledgerId}/transactions`,
    icon: ArrowRightLeft,
  },
  {
    name: '자산 현황',
    href: `/ledgers/${ledgerId}/assets`,
    icon: Wallet,
  },
  {
    name: '통계',
    href: `/ledgers/${ledgerId}/statistics`,
    icon: BarChart3,
  },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const location = useLocation()
  const currentLedger = mockLedgers[0] // 첫 번째 가계부를 기본으로 사용

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-background fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r transition-transform md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center justify-between px-4 md:hidden">
            <span className="text-lg font-semibold">메뉴</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {/* 메인 네비게이션 */}
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* 현재 가계부 네비게이션 */}
            {currentLedger && (
              <>
                <div className="my-4 border-t" />
                <div className="px-3 py-2">
                  <p className="text-muted-foreground text-xs font-semibold">
                    {currentLedger.name}
                  </p>
                </div>
                <div className="space-y-1">
                  {getLedgerNavigation(currentLedger.id).map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </>
            )}

            <div className="my-4 border-t" />

            {/* 설정 */}
            <Link
              to="/settings"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === '/settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Settings className="h-5 w-5" />
              설정
            </Link>
          </nav>
        </div>
      </aside>
    </>
  )
}
