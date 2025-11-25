import { Link, useLocation, useParams } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ArrowRightLeft,
  Wallet,
  BarChart3,
  Settings,
  X,
  Settings2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useMockDataStore } from '@/stores/mockDataStore'

const navigation = [
  {
    name: '가계부',
    href: '/ledgers',
    icon: BookOpen,
  },
]

const getLedgerNavigation = (ledgerId: string) => [
  {
    name: '대시보드',
    href: `/ledgers/${ledgerId}/dashboard`,
    icon: LayoutDashboard,
  },
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
  {
    name: '카테고리 설정',
    href: `/ledgers/${ledgerId}/settings/categories`,
    icon: Settings2,
  },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const location = useLocation()
  const params = useParams<{ ledgerId?: string }>()
  const { ledgers } = useMockDataStore()

  // URL에서 현재 가계부 ID 추출
  const currentLedgerId = params.ledgerId
  const currentLedger = currentLedgerId ? ledgers.find((l) => l.id === currentLedgerId) : null

  // 가계부 관련 경로인지 확인
  const isLedgerRoute = location.pathname.includes('/ledgers/') && currentLedgerId

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform md:translate-x-0',
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

            {/* 현재 선택된 가계부 네비게이션 */}
            {currentLedger && isLedgerRoute && (
              <>
                <div className="my-4 border-t" />
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {currentLedger.name}
                  </p>
                </div>
                <div className="space-y-1">
                  {getLedgerNavigation(currentLedger.id).map((item) => {
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
