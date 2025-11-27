import { useState, useMemo, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, Wallet, Plus } from 'lucide-react'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MonthPicker } from '@/components/dashboard/MonthPicker'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export function DashboardPage() {
  const { ledgerId } = useParams<{ ledgerId: string }>()
  const { ledgers } = useLedgerStore()

  // 빈 배열을 상수로 정의하여 같은 참조를 유지
  const EMPTY_ARRAY: Transaction[] = []

  const transactions = useTransactionStore((state) => {
    if (!ledgerId) return EMPTY_ARRAY
    return state.transactions[ledgerId] || EMPTY_ARRAY
  })
  const fetchTransactionsByMonth = useTransactionStore((state) => state.fetchTransactionsByMonth)

  // 현재 날짜를 기본값으로 설정 (YYYY-MM 형식)
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)

  // 가계부별 거래내역 조회 (페이지 마운트 시 및 포커스 시, 월별 조회)
  useEffect(() => {
    if (!ledgerId) return

    // 선택한 월 조회
    const [year, month] = selectedMonth.split('-').map(Number)
    fetchTransactionsByMonth(ledgerId, year, month)

    // 페이지 포커스 시 다시 조회
    const handleFocus = () => {
      fetchTransactionsByMonth(ledgerId, year, month)
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, selectedMonth])

  // ledgerId가 없으면 첫 번째 가계부로 리다이렉트
  if (!ledgerId) {
    const firstLedger = ledgers[0]
    if (firstLedger) {
      return <Navigate to={`/ledgers/${firstLedger.id}/dashboard`} replace />
    }
    return <Navigate to="/ledgers" replace />
  }

  const currentLedger = ledgers.find((l) => l.id === ledgerId)

  // 선택한 년도/월 파싱
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)

  const summary = useMemo(() => {
    if (!currentLedger) return { income: 0, expense: 0, balance: 0 }

    const monthTransactions = transactions.filter(
      (t) =>
        t.ledgerId === currentLedger.id &&
        t.date.getFullYear() === selectedYear &&
        t.date.getMonth() === selectedMonthNum - 1 // getMonth()는 0부터 시작
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
  }, [currentLedger, transactions, selectedYear, selectedMonthNum])

  // 카테고리별 지출 분석
  const expenseByCategory = useMemo(() => {
    if (!currentLedger) return []

    const monthExpenses = transactions.filter(
      (t) =>
        t.ledgerId === currentLedger.id &&
        t.type === 'expense' &&
        t.date.getFullYear() === selectedYear &&
        t.date.getMonth() === selectedMonthNum - 1
    )

    const categoryMap = new Map<string, number>()
    monthExpenses.forEach((t) => {
      const current = categoryMap.get(t.category1) || 0
      categoryMap.set(t.category1, current + t.amount)
    })

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [currentLedger, transactions, selectedYear, selectedMonthNum])

  // 차트용 데이터 (Top 5 + 기타)
  const chartData = useMemo(() => {
    if (expenseByCategory.length === 0) return []

    const top5 = expenseByCategory.slice(0, 5)
    const others = expenseByCategory.slice(5).reduce((sum, item) => sum + item.amount, 0)

    const data = top5.map((item) => ({
      name: item.category,
      value: item.amount,
    }))

    if (others > 0) {
      data.push({
        name: '기타',
        value: others,
      })
    }

    return data
  }, [expenseByCategory])

  // 차트 색상 팔레트
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#FF7C7C',
  ]

  if (!currentLedger) {
    return <div>가계부를 먼저 생성해주세요.</div>
  }

  // 선택한 월의 날짜 객체 생성 (표시용)
  const selectedDate = new Date(selectedYear, selectedMonthNum - 1, 1)
  const monthLabel = format(selectedDate, 'yyyy년 M월', { locale: ko })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="mt-1 text-muted-foreground">{monthLabel} 재무 현황</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* 년도/월 선택 */}
          <MonthPicker
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            transactions={transactions}
            ledgerId={ledgerId}
          />
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              // 거래 추가는 TransactionsPage에서 처리
              window.location.href = `/ledgers/${currentLedger.id}/transactions`
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            거래 추가
          </Button>
        </div>
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
            <p className="mt-1 text-xs text-muted-foreground">{monthLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 지출</CardTitle>
            <ArrowDownRight className="h-4 w-4 flex-shrink-0 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</div>
            <p className="mt-1 text-xs text-muted-foreground">{monthLabel}</p>
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

      {/* 통계 섹션 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 카테고리별 지출 차트 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                지출 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        {/* 카테고리별 지출 상세 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출 상세</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <div className="space-y-4">
                {expenseByCategory.map((item) => {
                  const percentage = summary.expense > 0 ? (item.amount / summary.expense) * 100 : 0
                  return (
                    <div key={item.category}>
                      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium">{item.category}</span>
                        <div className="text-left sm:text-right">
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({formatPercent(percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                지출 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 가계부 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>가계부 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{currentLedger.name}</h3>
                <p className="text-sm text-muted-foreground">{currentLedger.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{currentLedger.members.length}명의 멤버</span>
            </div>
            <Link to="/ledgers">
              <Button variant="outline" className="w-full">
                다른 가계부 보기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
