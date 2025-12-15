import { useState, useMemo, useEffect, type ReactElement } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { ArrowUpRight, ArrowDownRight, Wallet, Plus } from 'lucide-react'
import { useLedgerStore } from '@/entities/ledger/model/store'
import { useTransactionStore } from '@/entities/transaction/model/store'
import { useLedgerPermission } from '@/shared/hooks/useLedgerPermission'
import { formatCurrency, formatPercent } from '@/shared/lib/utils'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MonthPicker } from '@/widgets/dashboard-summary/ui/MonthPicker'
import type { Transaction } from '@/shared/types'

export function DashboardPage() {
  const { ledgerId } = useParams<{ ledgerId: string }>()
  const { ledgers } = useLedgerStore()
  const { canEdit } = useLedgerPermission(ledgerId)

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

  const currentLedger = ledgerId ? (ledgers.find((l) => l.id === ledgerId) ?? null) : null

  // 가계부별 거래내역 조회 (페이지 마운트 시, 월별 조회)
  useEffect(() => {
    if (!ledgerId || !currentLedger?.encryptionKey) return

    const [year, month] = selectedMonth.split('-').map(Number)
    fetchTransactionsByMonth(ledgerId, year, month)
  }, [ledgerId, selectedMonth, fetchTransactionsByMonth, currentLedger?.encryptionKey])

  let redirectElement: ReactElement | null = null
  if (!ledgerId) {
    const firstLedger = ledgers[0]
    redirectElement = firstLedger ? (
      <Navigate to={`/ledgers/${firstLedger.id}/dashboard`} replace />
    ) : (
      <Navigate to="/ledgers" replace />
    )
  }

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

  // 결제수단 2단계별 지출 분석
  const expenseByPaymentMethod2 = useMemo(() => {
    if (!currentLedger) return []

    const monthExpenses = transactions.filter(
      (t) =>
        t.ledgerId === currentLedger.id &&
        t.type === 'expense' &&
        t.date.getFullYear() === selectedYear &&
        t.date.getMonth() === selectedMonthNum - 1
    )

    const paymentMethodMap = new Map<string, number>()
    monthExpenses.forEach((t) => {
      // paymentMethod2가 있으면 사용, 없으면 "미지정"으로 처리
      const paymentMethod = t.paymentMethod2 || '미지정'
      const current = paymentMethodMap.get(paymentMethod) || 0
      paymentMethodMap.set(paymentMethod, current + t.amount)
    })

    return Array.from(paymentMethodMap.entries())
      .map(([paymentMethod, amount]) => ({ paymentMethod, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [currentLedger, transactions, selectedYear, selectedMonthNum])

  // 막대그래프 색상 팔레트
  const BAR_COLORS = [
    '#0088FE', // 파란색
    '#00C49F', // 청록색
    '#FFBB28', // 노란색
    '#FF8042', // 주황색
    '#8884D8', // 보라색
    '#82CA9D', // 연두색
    '#FFC658', // 황금색
    '#FF7C7C', // 연분홍색
    '#8DD1E1', // 하늘색
    '#D0844C', // 갈색
    '#A4DE6C', // 라임색
    '#FFB6C1', // 핑크색
  ]

  if (redirectElement) {
    return redirectElement
  }

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
          {ledgerId && (
            <MonthPicker
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              transactions={transactions}
              ledgerId={ledgerId}
            />
          )}
          {canEdit && (
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
          )}
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
        {/* 결제수단별 지출 */}
        <Card>
          <CardHeader>
            <CardTitle>결제수단별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByPaymentMethod2.length > 0 ? (
              <div className="space-y-4">
                {expenseByPaymentMethod2.map((item, index) => {
                  const percentage = summary.expense > 0 ? (item.amount / summary.expense) * 100 : 0
                  const barColor = BAR_COLORS[index % BAR_COLORS.length]
                  return (
                    <div key={item.paymentMethod}>
                      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium">{item.paymentMethod}</span>
                        <div className="text-left sm:text-right">
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({formatPercent(percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: barColor }}
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

        {/* 카테고리별 지출 상세 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출 상세</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length > 0 ? (
              <div className="space-y-4">
                {expenseByCategory.map((item, index) => {
                  const percentage = summary.expense > 0 ? (item.amount / summary.expense) * 100 : 0
                  const barColor = BAR_COLORS[index % BAR_COLORS.length]
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
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: barColor }}
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
    </div>
  )
}
