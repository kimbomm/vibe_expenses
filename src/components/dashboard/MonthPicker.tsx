import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types'

interface MonthPickerProps {
  selectedMonth: string // YYYY-MM 형식
  onMonthChange: (month: string) => void
  transactions: Transaction[]
  ledgerId: string
}

export function MonthPicker({
  selectedMonth,
  onMonthChange,
  transactions,
  ledgerId,
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 선택한 년도/월 파싱
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number)
  const selectedDate = new Date(selectedYear, selectedMonthNum - 1, 1)

  // 해당 가계부의 거래 데이터 범위 계산
  const dateRange = useMemo(() => {
    const ledgerTransactions = transactions.filter((t) => t.ledgerId === ledgerId)

    if (ledgerTransactions.length === 0) {
      const now = new Date()
      return {
        startYear: now.getFullYear(),
        startMonth: now.getMonth() + 1,
        endYear: now.getFullYear(),
        endMonth: now.getMonth() + 1,
      }
    }

    // 가장 빠른 거래 날짜
    const earliestDate = new Date(Math.min(...ledgerTransactions.map((t) => t.date.getTime())))

    // 현재 날짜
    const now = new Date()

    return {
      startYear: earliestDate.getFullYear(),
      startMonth: earliestDate.getMonth() + 1,
      endYear: now.getFullYear(),
      endMonth: 12, // 현재 년도의 12월까지
    }
  }, [transactions, ledgerId])

  // 선택 가능한 년/월인지 확인
  const isMonthAvailable = (year: number, month: number) => {
    // 시작 년도 이전은 불가
    if (year < dateRange.startYear) return false
    // 시작 년도인데 시작 월 이전은 불가
    if (year === dateRange.startYear && month < dateRange.startMonth) return false
    // 종료 년도 이후는 불가
    if (year > dateRange.endYear) return false
    // 종료 년도인데 종료 월 이후는 불가
    if (year === dateRange.endYear && month > dateRange.endMonth) return false
    return true
  }

  // 현재 표시할 년도 (드롭다운에서)
  const [displayYear, setDisplayYear] = useState(selectedYear)

  // 이전/다음 년도로 이동 가능한지 확인
  const canGoPrevYear = displayYear > dateRange.startYear
  const canGoNextYear = displayYear < dateRange.endYear

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleMonthSelect = (month: string) => {
    onMonthChange(month)
    setIsOpen(false)
  }

  const handlePrevYear = () => {
    setDisplayYear(displayYear - 1)
  }

  const handleNextYear = () => {
    setDisplayYear(displayYear + 1)
  }

  const monthLabels = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]

  const selectedMonthLabel = format(selectedDate, 'yyyy년 M월', { locale: ko })

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-[160px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{selectedMonthLabel}</span>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-lg border bg-background shadow-lg">
          <div className="p-3">
            {/* 년도 네비게이션 */}
            <div className="mb-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevYear}
                disabled={!canGoPrevYear}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold">{displayYear}년</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextYear}
                disabled={!canGoNextYear}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* 월 그리드 */}
            <div className="grid grid-cols-3 gap-2">
              {monthLabels.map((label, index) => {
                const month = index + 1
                const monthKey = `${displayYear}-${String(month).padStart(2, '0')}`
                const isAvailable = isMonthAvailable(displayYear, month)
                const isSelected = selectedMonth === monthKey

                return (
                  <button
                    key={month}
                    onClick={() => isAvailable && handleMonthSelect(monthKey)}
                    disabled={!isAvailable}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : isAvailable
                          ? 'hover:bg-accent hover:text-accent-foreground'
                          : 'cursor-not-allowed text-muted-foreground opacity-40'
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
