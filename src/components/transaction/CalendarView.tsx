import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Transaction } from '@/types'

interface CalendarViewProps {
  transactions: Transaction[]
  currentDate: Date
  onDateChange: (date: Date) => void
  selectedWeek?: Date | null
  onDateClick?: (date: Date) => void
}

export function CalendarView({
  transactions,
  currentDate,
  onDateChange,
  selectedWeek,
  onDateClick,
}: CalendarViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // 날짜별 거래 그룹핑
  const transactionsByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    transactions.forEach((t) => {
      const dateKey = format(t.date, 'yyyy-MM-dd')
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(t)
    })
    return map
  }, [transactions])

  // 날짜별 수입/지출 합계
  const getDateSummary = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const dayTransactions = transactionsByDate.get(dateKey) || []
    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return { income, expense, count: dayTransactions.length }
  }

  // 해당 날짜가 선택된 주에 속하는지 확인
  const isInSelectedWeek = (date: Date) => {
    if (!selectedWeek) return false
    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 0 })
    return date >= weekStart && date <= weekEnd
  }

  const handlePrevMonth = () => {
    onDateChange(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    onDateChange(addMonths(currentDate, 1))
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="w-full border-0 bg-background md:rounded-lg md:border">
      <div className="p-2 md:p-6">
        {/* 헤더 */}
        <div className="mb-2 flex items-center justify-between md:mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevMonth}
            className="h-9 w-9 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h3 className="text-xl font-normal text-gray-700">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-9 w-9 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b pb-0.5 md:pb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-normal text-gray-500 md:text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const summary = getDateSummary(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = isSameDay(day, new Date())
            const isWeekSelected = selectedWeek && isInSelectedWeek(day)
            const hasTransactions = summary.count > 0

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateClick?.(day)}
                className={cn(
                  'group relative flex aspect-[1/1.2] flex-col items-center justify-start border-b border-r border-gray-100 p-0.5 transition-colors md:aspect-square md:p-2',
                  'hover:bg-gray-50',
                  !isCurrentMonth && 'bg-gray-50/50 text-gray-400',
                  isToday && 'bg-blue-50'
                )}
              >
                {/* 날짜 숫자 */}
                <div
                  className={cn(
                    'mb-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-normal transition-colors md:mb-1 md:h-7 md:w-7 md:text-sm',
                    isToday
                      ? 'bg-blue-600 font-medium text-white'
                      : isCurrentMonth
                        ? 'text-gray-700 group-hover:bg-gray-200'
                        : 'text-gray-400'
                  )}
                >
                  {format(day, 'd')}
                </div>

                {/* 거래 금액 표시 - 항상 렌더링하여 높이 일정하게 유지 */}
                <div className="mt-auto flex min-h-[24px] w-full flex-col justify-end gap-0.5 md:min-h-[28px]">
                  {summary.income > 0 && (
                    <div className="truncate text-[9px] font-medium text-green-600 md:text-[11px]">
                      +{formatCurrency(summary.income)}
                    </div>
                  )}
                  {summary.expense > 0 && (
                    <div className="truncate text-[9px] font-medium text-red-600 md:text-[11px]">
                      -{formatCurrency(summary.expense)}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
