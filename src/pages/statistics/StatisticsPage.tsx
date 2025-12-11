import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MonthPicker } from '@/components/dashboard/MonthPicker'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  DollarSign,
} from 'lucide-react'

export function StatisticsPage() {
  const { ledgerId } = useParams<{ ledgerId: string }>()
  const { ledgers } = useLedgerStore()

  // 빈 배열을 상수로 정의하여 같은 참조를 유지
  const EMPTY_ARRAY: Transaction[] = []

  const transactions = useTransactionStore((state) => {
    if (!ledgerId) return EMPTY_ARRAY
    return state.transactions[ledgerId] || EMPTY_ARRAY
  })
  const fetchTransactionsByMonth = useTransactionStore((state) => state.fetchTransactionsByMonth)

  // 현재 날짜를 기본값으로 설정
  const now = new Date()
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)

  // 가계부별 거래내역 조회 (페이지 마운트 시, 월별 조회)
  const currentLedger = ledgerId ? (ledgers.find((l) => l.id === ledgerId) ?? null) : null

  useEffect(() => {
    if (!ledgerId || !currentLedger?.encryptionKey) return

    const [year, month] = selectedMonth.split('-').map(Number)
    fetchTransactionsByMonth(ledgerId, year, month)
  }, [ledgerId, selectedMonth, fetchTransactionsByMonth, currentLedger?.encryptionKey])

  // 선택한 년도/월 파싱
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)
  const selectedDate = new Date(selectedYear, selectedMonthNum - 1, 1)
  const monthLabel = format(selectedDate, 'yyyy년 M월', { locale: ko })

  // 현재 월 거래 필터링
  const currentMonthTransactions = useMemo(() => {
    if (!ledgerId) return []
    return transactions.filter(
      (t) =>
        t.ledgerId === ledgerId &&
        t.date.getFullYear() === selectedYear &&
        t.date.getMonth() === selectedMonthNum - 1
    )
  }, [ledgerId, transactions, selectedYear, selectedMonthNum])

  // 전월 거래 필터링
  const prevMonthTransactions = useMemo(() => {
    if (!ledgerId) return []
    const prevDate = new Date(selectedYear, selectedMonthNum - 2, 1)
    return transactions.filter(
      (t) =>
        t.ledgerId === ledgerId &&
        t.date.getFullYear() === prevDate.getFullYear() &&
        t.date.getMonth() === prevDate.getMonth()
    )
  }, [ledgerId, transactions, selectedYear, selectedMonthNum])

  // 전년 동월 거래 필터링
  const prevYearMonthTransactions = useMemo(() => {
    if (!ledgerId) return []
    return transactions.filter(
      (t) =>
        t.ledgerId === ledgerId &&
        t.date.getFullYear() === selectedYear - 1 &&
        t.date.getMonth() === selectedMonthNum - 1
    )
  }, [ledgerId, transactions, selectedYear, selectedMonthNum])

  // 현재 월 요약
  const currentSummary = useMemo(() => {
    const income = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [currentMonthTransactions])

  // 전월 요약
  const prevMonthSummary = useMemo(() => {
    const income = prevMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = prevMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [prevMonthTransactions])

  // 전년 동월 요약
  const prevYearSummary = useMemo(() => {
    const income = prevYearMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = prevYearMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [prevYearMonthTransactions])

  // 증감율 계산
  const getChangeRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // 월별 트렌드 데이터 (최근 6개월)
  const monthlyTrend = useMemo(() => {
    if (!ledgerId) return []
    const months: Array<{ month: string; income: number; expense: number; balance: number }> = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonthNum - 1 - i, 1)
      const monthTransactions = transactions.filter(
        (t) =>
          t.ledgerId === ledgerId &&
          t.date.getFullYear() === date.getFullYear() &&
          t.date.getMonth() === date.getMonth()
      )
      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      months.push({
        month: format(date, 'M월', { locale: ko }),
        income,
        expense,
        balance: income - expense,
      })
    }
    return months
  }, [ledgerId, transactions, selectedYear, selectedMonthNum])

  // 결제수단 1단계별 분석
  const expenseByPaymentMethod1 = useMemo(() => {
    const expenses = currentMonthTransactions.filter((t) => t.type === 'expense')
    const methodMap = new Map<string, number>()
    expenses.forEach((t) => {
      const method = t.paymentMethod1 || '미지정'
      const current = methodMap.get(method) || 0
      methodMap.set(method, current + t.amount)
    })
    return Array.from(methodMap.entries())
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [currentMonthTransactions])

  // 결제수단 2단계별 분석
  const expenseByPaymentMethod2 = useMemo(() => {
    const expenses = currentMonthTransactions.filter((t) => t.type === 'expense')
    const methodMap = new Map<string, number>()
    expenses.forEach((t) => {
      const method = t.paymentMethod2 || '미지정'
      const current = methodMap.get(method) || 0
      methodMap.set(method, current + t.amount)
    })
    return Array.from(methodMap.entries())
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [currentMonthTransactions])

  // 지출 카테고리 1단계별 분석
  const expenseByCategory1 = useMemo(() => {
    const expenses = currentMonthTransactions.filter((t) => t.type === 'expense')
    const categoryMap = new Map<string, number>()
    expenses.forEach((t) => {
      const current = categoryMap.get(t.category1) || 0
      categoryMap.set(t.category1, current + t.amount)
    })
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [currentMonthTransactions])

  // 지출 카테고리 2단계별 분석
  const expenseByCategory2 = useMemo(() => {
    const expenses = currentMonthTransactions.filter((t) => t.type === 'expense')
    const categoryMap = new Map<string, number>()
    expenses.forEach((t) => {
      const category = `${t.category1} > ${t.category2}`
      const current = categoryMap.get(category) || 0
      categoryMap.set(category, current + t.amount)
    })
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [currentMonthTransactions])

  // 수입 카테고리 1단계별 분석
  const incomeByCategory1 = useMemo(() => {
    const incomes = currentMonthTransactions.filter((t) => t.type === 'income')
    const categoryMap = new Map<string, number>()
    incomes.forEach((t) => {
      const current = categoryMap.get(t.category1) || 0
      categoryMap.set(t.category1, current + t.amount)
    })
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [currentMonthTransactions])

  // 수입 카테고리 2단계별 분석
  const incomeByCategory2 = useMemo(() => {
    const incomes = currentMonthTransactions.filter((t) => t.type === 'income')
    const categoryMap = new Map<string, number>()
    incomes.forEach((t) => {
      const category = `${t.category1} > ${t.category2}`
      const current = categoryMap.get(category) || 0
      categoryMap.set(category, current + t.amount)
    })
    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [currentMonthTransactions])

  // 요일별 패턴 분석
  const expenseByDayOfWeek = useMemo(() => {
    const expenses = currentMonthTransactions.filter((t) => t.type === 'expense')
    const dayMap = new Map<number, { count: number; total: number }>()
    expenses.forEach((t) => {
      const day = t.date.getDay() // 0: 일요일, 6: 토요일
      const current = dayMap.get(day) || { count: 0, total: 0 }
      dayMap.set(day, { count: current.count + 1, total: current.total + t.amount })
    })
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
    return Array.from(dayMap.entries())
      .map(([day, data]) => ({
        day: dayLabels[day],
        count: data.count,
        total: data.total,
        average: data.count > 0 ? data.total / data.count : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [currentMonthTransactions])

  // Top 거래 내역
  const topTransactions = useMemo(() => {
    const sorted = [...currentMonthTransactions].sort((a, b) => b.amount - a.amount)
    return {
      topExpenses: sorted.filter((t) => t.type === 'expense').slice(0, 5),
      topIncomes: sorted.filter((t) => t.type === 'income').slice(0, 5),
    }
  }, [currentMonthTransactions])

  // 통계 지표
  const stats = useMemo(() => {
    const expenses = currentMonthTransactions.filter((t) => t.type === 'expense')
    const dailyExpenses = expenses.map((t) => t.amount)
    const avgDailyExpense =
      expenses.length > 0 ? dailyExpenses.reduce((sum, amt) => sum + amt, 0) / expenses.length : 0
    const maxExpense = dailyExpenses.length > 0 ? Math.max(...dailyExpenses) : 0
    const maxExpenseDate = expenses.find((t) => t.amount === maxExpense)?.date

    const incomes = currentMonthTransactions.filter((t) => t.type === 'income')
    const dailyIncomes = incomes.map((t) => t.amount)
    const avgDailyIncome =
      incomes.length > 0 ? dailyIncomes.reduce((sum, amt) => sum + amt, 0) / incomes.length : 0
    const maxIncome = dailyIncomes.length > 0 ? Math.max(...dailyIncomes) : 0
    const maxIncomeDate = incomes.find((t) => t.amount === maxIncome)?.date

    return {
      avgDailyExpense,
      maxExpense,
      maxExpenseDate,
      avgDailyIncome,
      maxIncome,
      maxIncomeDate,
      totalTransactions: currentMonthTransactions.length,
    }
  }, [currentMonthTransactions])

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

  // Early return은 모든 hooks 호출 후에 위치
  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  if (!currentLedger) {
    return <div>가계부를 찾을 수 없습니다.</div>
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">통계 분석</h1>
          <p className="mt-1 text-muted-foreground">{monthLabel} 상세 분석</p>
        </div>
        <MonthPicker
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          transactions={transactions}
          ledgerId={ledgerId}
        />
      </div>

      {/* 기간별 비교 분석 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 수입</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(currentSummary.income)}
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center gap-1">
                {prevMonthSummary.income > 0 && (
                  <>
                    {getChangeRate(currentSummary.income, prevMonthSummary.income) >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-muted-foreground">
                      전월 대비{' '}
                      {formatPercent(
                        Math.abs(getChangeRate(currentSummary.income, prevMonthSummary.income))
                      )}
                    </span>
                  </>
                )}
              </div>
              {prevYearSummary.income > 0 && (
                <div className="flex items-center gap-1">
                  {getChangeRate(currentSummary.income, prevYearSummary.income) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-muted-foreground">
                    전년 동월 대비{' '}
                    {formatPercent(
                      Math.abs(getChangeRate(currentSummary.income, prevYearSummary.income))
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 지출</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(currentSummary.expense)}
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center gap-1">
                {prevMonthSummary.expense > 0 && (
                  <>
                    {getChangeRate(currentSummary.expense, prevMonthSummary.expense) >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    )}
                    <span className="text-muted-foreground">
                      전월 대비{' '}
                      {formatPercent(
                        Math.abs(getChangeRate(currentSummary.expense, prevMonthSummary.expense))
                      )}
                    </span>
                  </>
                )}
              </div>
              {prevYearSummary.expense > 0 && (
                <div className="flex items-center gap-1">
                  {getChangeRate(currentSummary.expense, prevYearSummary.expense) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-red-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-green-500" />
                  )}
                  <span className="text-muted-foreground">
                    전년 동월 대비{' '}
                    {formatPercent(
                      Math.abs(getChangeRate(currentSummary.expense, prevYearSummary.expense))
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">순 수입</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentSummary.balance)}</div>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center gap-1">
                {prevMonthSummary.balance !== 0 && (
                  <>
                    {getChangeRate(currentSummary.balance, prevMonthSummary.balance) >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-muted-foreground">
                      전월 대비{' '}
                      {formatPercent(
                        Math.abs(getChangeRate(currentSummary.balance, prevMonthSummary.balance))
                      )}
                    </span>
                  </>
                )}
              </div>
              {prevYearSummary.balance !== 0 && (
                <div className="flex items-center gap-1">
                  {getChangeRate(currentSummary.balance, prevYearSummary.balance) >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className="text-muted-foreground">
                    전년 동월 대비{' '}
                    {formatPercent(
                      Math.abs(getChangeRate(currentSummary.balance, prevYearSummary.balance))
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 월별 트렌드 */}
      <Card>
        <CardHeader>
          <CardTitle>월별 트렌드 (최근 6개월)</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                    return value.toString()
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: '#374151', fontSize: '14px' }}>{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="수입"
                  dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="지출"
                  dot={{ fill: '#ef4444', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  name="순 수입"
                  dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* 지출 카테고리별 분석 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>지출 카테고리별 분석 (대분류)</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory1.length > 0 ? (
              <div className="space-y-2">
                {expenseByCategory1.map((item, index) => {
                  const percentage =
                    currentSummary.expense > 0 ? (item.amount / currentSummary.expense) * 100 : 0
                  return (
                    <div key={item.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                          />
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({formatPercent(percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                지출 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>지출 카테고리별 분석 (소분류)</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory2.length > 0 ? (
              <div className="space-y-2">
                {expenseByCategory2.map((item, index) => {
                  const percentage =
                    currentSummary.expense > 0 ? (item.amount / currentSummary.expense) * 100 : 0
                  return (
                    <div key={item.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                          />
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({formatPercent(percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                지출 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 결제수단별 분석 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>결제수단별 분석 (1단계)</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByPaymentMethod1.length > 0 ? (
              <div className="space-y-2">
                {expenseByPaymentMethod1.map((item, index) => {
                  const percentage =
                    currentSummary.expense > 0 ? (item.amount / currentSummary.expense) * 100 : 0
                  return (
                    <div key={item.method}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                          />
                          <span className="font-medium">{item.method}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({formatPercent(percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                지출 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>결제수단별 분석 (2단계)</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByPaymentMethod2.length > 0 ? (
              <div className="space-y-2">
                {expenseByPaymentMethod2.map((item, index) => {
                  const percentage =
                    currentSummary.expense > 0 ? (item.amount / currentSummary.expense) * 100 : 0
                  return (
                    <div key={item.method}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                          />
                          <span className="font-medium">{item.method}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{formatCurrency(item.amount)}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({formatPercent(percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                지출 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 수입 카테고리별 분석 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>수입 카테고리별 분석 (대분류)</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeByCategory1.length > 0 ? (
              <div className="space-y-2">
                {incomeByCategory1.map((item, index) => {
                  const percentage =
                    currentSummary.income > 0 ? (item.amount / currentSummary.income) * 100 : 0
                  return (
                    <div key={item.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                          />
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-600">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({formatPercent(percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                수입 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>수입 카테고리별 분석 (소분류)</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeByCategory2.length > 0 ? (
              <div className="space-y-2">
                {incomeByCategory2.map((item, index) => {
                  const percentage =
                    currentSummary.income > 0 ? (item.amount / currentSummary.income) * 100 : 0
                  return (
                    <div key={item.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                          />
                          <span className="font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-600">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({formatPercent(percentage)})
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                수입 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 요일별 패턴 & 통계 지표 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>요일별 지출 패턴</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByDayOfWeek.length > 0 ? (
              <div className="space-y-2 text-sm">
                {expenseByDayOfWeek.map((item, index) => (
                  <div key={item.day} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                      />
                      <span className="font-medium">{item.day}요일</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(item.total)}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.count}건, 평균 {formatCurrency(item.average)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                지출 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>통계 지표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">평균 일일 지출</span>
                  </div>
                  <span className="font-bold">{formatCurrency(stats.avgDailyExpense)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">최대 지출</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(stats.maxExpense)}</div>
                    {stats.maxExpenseDate && (
                      <div className="text-xs text-muted-foreground">
                        {format(stats.maxExpenseDate, 'M월 d일', { locale: ko })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">평균 일일 수입</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(stats.avgDailyIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">최대 수입</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(stats.maxIncome)}
                    </div>
                    {stats.maxIncomeDate && (
                      <div className="text-xs text-muted-foreground">
                        {format(stats.maxIncomeDate, 'M월 d일', { locale: ko })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">총 거래 건수</span>
                  </div>
                  <span className="font-bold">{stats.totalTransactions}건</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 거래 내역 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 지출</CardTitle>
          </CardHeader>
          <CardContent>
            {topTransactions.topExpenses.length > 0 ? (
              <div className="space-y-3">
                {topTransactions.topExpenses.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                          {index + 1}
                        </span>
                        <span className="font-medium">{transaction.description}</span>
                      </div>
                      <div className="ml-8 mt-1 text-xs text-muted-foreground">
                        {transaction.category1} &gt; {transaction.category2}
                        {transaction.paymentMethod1 && <> · {transaction.paymentMethod1}</>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(transaction.date, 'M월 d일', { locale: ko })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                지출 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 수입</CardTitle>
          </CardHeader>
          <CardContent>
            {topTransactions.topIncomes.length > 0 ? (
              <div className="space-y-3">
                {topTransactions.topIncomes.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600">
                          {index + 1}
                        </span>
                        <span className="font-medium">{transaction.description}</span>
                      </div>
                      <div className="ml-8 mt-1 text-xs text-muted-foreground">
                        {transaction.category1} &gt; {transaction.category2}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(transaction.date, 'M월 d일', { locale: ko })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                수입 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
