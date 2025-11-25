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
  getDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
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
    <Card>
      <div className="p-4">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'yyyy년 M월', { locale: ko })}
          </h3>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-1">
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
                  'group relative flex min-h-[80px] flex-col rounded-lg border p-2 text-left transition-all hover:bg-accent hover:shadow-sm',
                  !isCurrentMonth && 'text-muted-foreground opacity-50',
                  isToday && 'border-primary bg-primary/5 font-semibold',
                  isWeekSelected && 'border-primary bg-primary/20 shadow-sm ring-2 ring-primary/20'
                )}
              >
                <div className="mb-1 text-sm font-medium">{format(day, 'd')}</div>
                {hasTransactions && (
                  <div className="mt-auto space-y-0.5">
                    {summary.income > 0 && (
                      <div className="text-[10px] font-medium text-green-600">
                        +{(summary.income / 1000).toFixed(0)}k
                      </div>
                    )}
                    {summary.expense > 0 && (
                      <div className="text-[10px] font-medium text-red-600">
                        -{(summary.expense / 1000).toFixed(0)}k
                      </div>
                    )}
                    {summary.count > 2 && (
                      <div className="text-[10px] text-muted-foreground">+{summary.count - 2}</div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
