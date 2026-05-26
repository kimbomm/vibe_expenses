import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLedgerStore } from '@/entities/ledger/model/store'
import { useTransactionStore } from '@/entities/transaction/model/store'
import type { Transaction } from '@/shared/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function useStatisticsPage() {
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

  return {
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
  }
}
