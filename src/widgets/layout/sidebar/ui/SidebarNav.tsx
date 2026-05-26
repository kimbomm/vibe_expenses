import { Link, useLocation, useParams } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ArrowRightLeft,
  Wallet,
  BarChart3,
  Settings,
  Settings2,
  Users,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

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
  {
    name: '멤버 관리',
    href: `/ledgers/${ledgerId}/members`,
    icon: Users,
  },
]

interface SidebarNavProps {
  ledgerName?: string
  ledgerId?: string
  onNavigate?: () => void
}

export function SidebarNav({ ledgerName, ledgerId, onNavigate }: SidebarNavProps) {
  const location = useLocation()

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <div className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
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

      {ledgerId && ledgerName ? (
        <>
          <div className="my-4 border-t" />
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground">{ledgerName}</p>
          </div>
          <div className="space-y-1">
            {getLedgerNavigation(ledgerId).map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onNavigate}
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
      ) : null}

      <div className="my-4 border-t" />

      <Link
        to="/settings"
        onClick={onNavigate}
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
  )
}

export function useSidebarLedger() {
  const location = useLocation()
  const params = useParams<{ ledgerId?: string }>()
  const ledgerIdFromPath = location.pathname.match(/\/ledgers\/([^/]+)/)?.[1]
  const fallbackLedgerId =
    typeof window !== 'undefined' ? localStorage.getItem('lastLedgerId') : null
  const effectiveLedgerId = params.ledgerId || ledgerIdFromPath || fallbackLedgerId

  return { effectiveLedgerId }
}
