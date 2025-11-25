import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Plus } from 'lucide-react'
import { useMockDataStore } from '@/stores/mockDataStore'
import { formatCurrency } from '@/lib/utils'

export function DashboardPage() {
  const { ledgers, transactions } = useMockDataStore()
  const currentLedger = ledgers[0]

  const summary = useMemo(() => {
    if (!currentLedger) return { income: 0, expense: 0, balance: 0 }
    const now = new Date()
    const monthTransactions = transactions.filter(
      (t) =>
        t.ledgerId === currentLedger.id &&
        t.date.getFullYear() === now.getFullYear() &&
        t.date.getMonth() === now.getMonth()
    )

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [currentLedger, transactions])

  if (!currentLedger) {
    return <div>가계부를 먼저 생성해주세요.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="mt-1 text-muted-foreground">11월 재무 현황</p>
        </div>
        <Link to={`/ledgers/${currentLedger.id}/transactions/new`}>
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            거래 추가
          </Button>
        </Link>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 수입</CardTitle>
            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.income)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">이번 달</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 지출</CardTitle>
            <ArrowDownRight className="h-4 w-4 flex-shrink-0 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</div>
            <p className="mt-1 text-xs text-muted-foreground">이번 달</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">순 수입</CardTitle>
            <Wallet className="h-4 w-4 flex-shrink-0 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
            <p className="mt-1 text-xs text-muted-foreground">수입 - 지출</p>
          </CardContent>
        </Card>
      </div>

      {/* 가계부 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>내 가계부</CardTitle>
            <Link to="/ledgers">
              <Button variant="ghost" size="sm">
                전체 보기
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ledgers.map((ledger) => (
              <Link
                key={ledger.id}
                to={`/ledgers/${ledger.id}/transactions`}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{ledger.name}</h3>
                    <p className="text-sm text-muted-foreground">{ledger.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{ledger.members.length}명</span>
                  <TrendingUp className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
