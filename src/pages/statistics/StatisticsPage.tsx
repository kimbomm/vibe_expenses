import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMockDataStore } from '@/stores/mockDataStore'
import { formatCurrency, formatPercent } from '@/lib/utils'

export function StatisticsPage() {
  const { ledgerId } = useParams()
  const { transactions } = useMockDataStore()

  const summary = useMemo(() => {
    if (!ledgerId) return { income: 0, expense: 0, balance: 0 }
    const now = new Date()
    const monthTransactions = transactions.filter(
      (t) =>
        t.ledgerId === ledgerId &&
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
  }, [ledgerId, transactions])

  const expenseByCategory = useMemo(() => {
    if (!ledgerId) return []
    const now = new Date()
    const monthExpenses = transactions.filter(
      (t) =>
        t.ledgerId === ledgerId &&
        t.type === 'expense' &&
        t.date.getFullYear() === now.getFullYear() &&
        t.date.getMonth() === now.getMonth()
    )

    const categoryMap = new Map<string, number>()
    monthExpenses.forEach((t) => {
      const current = categoryMap.get(t.category1) || 0
      categoryMap.set(t.category1, current + t.amount)
    })

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [ledgerId, transactions])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">통계</h1>
        <p className="mt-1 text-muted-foreground">11월 지출 분석</p>
      </div>

      {/* 월 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>11월 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">총 수입</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.income)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">총 지출</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">순 수입</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.balance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리별 지출 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 지출</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenseByCategory.map((item) => {
              const percentage = (item.amount / summary.expense) * 100
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
        </CardContent>
      </Card>
    </div>
  )
}
