import { useStatisticsPage } from './useStatisticsPage'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { formatCurrency, formatPercent } from '@/shared/lib/utils'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MonthPicker } from '@/widgets/dashboard-summary/ui/MonthPicker'
import {
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

export function StatisticsPageDesktop() {
  const {
    ledgerId,
    currentLedger,
    transactions,
    selectedMonth,
    setSelectedMonth,
    monthLabel,
    currentSummary,
    prevMonthSummary,
    prevYearSummary,
    getChangeRate,
    monthlyTrend,
    expenseByPaymentMethod1,
    expenseByPaymentMethod2,
    expenseByCategory1,
    expenseByCategory2,
    incomeByCategory1,
    incomeByCategory2,
    expenseByDayOfWeek,
    topTransactions,
    stats,
    BAR_COLORS,
  } = useStatisticsPage()

  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  if (!currentLedger) {
    return <div>가계부를 찾을 수 없습니다.</div>
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-row items-center justify-between gap-4">
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
      <div className="grid grid-cols-3 gap-4">
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
      <div className="grid grid-cols-2 gap-6">
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
      <div className="grid grid-cols-2 gap-6">
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
      <div className="grid grid-cols-2 gap-6">
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
      <div className="grid grid-cols-2 gap-6">
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
      <div className="grid grid-cols-2 gap-6">
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
