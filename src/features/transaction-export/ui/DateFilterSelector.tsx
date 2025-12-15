import { useState, useEffect } from 'react'
import { Card } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import type { DateFilterState, DateFilterType } from '@/shared/lib/export/transactionExporter'
import { getDateRangeFromTransactions } from '@/shared/lib/export/dateUtils'
import { getTransactionMonthKeys } from '@/entities/transaction/api/transactionApi'
import type { Transaction } from '@/shared/types'

interface DateFilterSelectorProps {
  filter: DateFilterState
  onChange: (filter: DateFilterState) => void
  transactions?: Transaction[] // 데이터 범위 표시용
  ledgerId?: string // 실제 데이터 범위 조회용
}

export function DateFilterSelector({
  filter,
  onChange,
  transactions,
  ledgerId,
}: DateFilterSelectorProps) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [actualDateRange, setActualDateRange] = useState<{
    start: Date
    end: Date
  } | null>(null)

  // 실제 데이터 범위 조회 (Firestore에서 월 목록 조회)
  useEffect(() => {
    console.log('DateFilterSelector useEffect 실행:', {
      ledgerId,
      hasTransactions: !!transactions?.length,
    })

    if (!ledgerId) {
      console.log('ledgerId가 없어서 조회를 건너뜁니다')
      // ledgerId가 없어도 Store의 transactions가 있으면 사용
      if (transactions && transactions.length > 0) {
        const range = getDateRangeFromTransactions(transactions)
        if (range) {
          console.log('ledgerId 없음 - Store에서 추출한 데이터 범위:', {
            start: `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`,
            end: `${range.end.getFullYear()}-${String(range.end.getMonth() + 1).padStart(2, '0')}`,
          })
          setActualDateRange(range)
        }
      }
      return
    }

    const fetchDateRange = async () => {
      try {
        console.log('getTransactionMonthKeys 호출 시작:', ledgerId)
        const monthKeys = await getTransactionMonthKeys(ledgerId)
        console.log('조회된 월 목록:', monthKeys)

        if (monthKeys.length > 0) {
          const firstMonth = monthKeys[0] // '2024-01'
          const lastMonth = monthKeys[monthKeys.length - 1] // '2024-12'
          const [startYear, startMonth] = firstMonth.split('-').map(Number)
          const [endYear, endMonth] = lastMonth.split('-').map(Number)

          const range = {
            start: new Date(startYear, startMonth - 1, 1),
            end: new Date(endYear, endMonth, 0), // 해당 월의 마지막 날
          }

          console.log('설정할 데이터 범위:', {
            start: `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`,
            end: `${range.end.getFullYear()}-${String(range.end.getMonth() + 1).padStart(2, '0')}`,
          })

          setActualDateRange(range)
        } else {
          console.log('월 목록이 비어있음 - Store에서 추출 시도')
          // Store에서 추출 시도
          if (transactions && transactions.length > 0) {
            const range = getDateRangeFromTransactions(transactions)
            if (range) {
              console.log('Store에서 추출한 데이터 범위:', {
                start: `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`,
                end: `${range.end.getFullYear()}-${String(range.end.getMonth() + 1).padStart(2, '0')}`,
              })
              setActualDateRange(range)
            } else {
              console.warn('Store의 transactions에서 날짜 범위를 추출할 수 없습니다.')
            }
          } else {
            console.warn('Store에 transactions가 없습니다. transactionStore에서 직접 조회 시도')
            // transactionStore에서 직접 조회 시도
            const { useTransactionStore } = await import('@/entities/transaction/model/store')
            const { getMonthKey } = await import('@/shared/lib/export/dateUtils')

            const storeTransactions = useTransactionStore.getState().transactions[ledgerId] || []
            if (storeTransactions.length > 0) {
              const range = getDateRangeFromTransactions(storeTransactions)
              if (range) {
                console.log('transactionStore에서 직접 추출한 데이터 범위:', {
                  start: `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`,
                  end: `${range.end.getFullYear()}-${String(range.end.getMonth() + 1).padStart(2, '0')}`,
                })
                setActualDateRange(range)
              }
            } else {
              console.warn('transactionStore에도 데이터가 없습니다.')
            }
          }
        }
      } catch (error) {
        console.error('데이터 범위 조회 실패:', error)
        // Store에서 추출 시도
        if (transactions && transactions.length > 0) {
          const range = getDateRangeFromTransactions(transactions)
          if (range) {
            console.log('에러 후 Store에서 추출한 데이터 범위:', {
              start: `${range.start.getFullYear()}-${String(range.start.getMonth() + 1).padStart(2, '0')}`,
              end: `${range.end.getFullYear()}-${String(range.end.getMonth() + 1).padStart(2, '0')}`,
            })
            setActualDateRange(range)
          }
        }
      }
    }

    fetchDateRange()
  }, [ledgerId, transactions]) // transactions도 의존성에 추가 (초기 로드 시 사용)

  // 데이터 범위 추출 (actualDateRange 우선, 없으면 Store 데이터 사용)
  const dateRange =
    actualDateRange || (transactions ? getDateRangeFromTransactions(transactions) : null)

  // 년도 범위: 데이터 범위의 시작 년도부터 현재 년도까지
  const dataStartYear = dateRange?.start.getFullYear()
  const dataEndYear = dateRange?.end.getFullYear()
  const minYear = dataStartYear ? Math.min(dataStartYear, currentYear) : currentYear
  const maxYear = currentYear // 항상 현재 년도까지
  const minMonth = dateRange?.start.getMonth() || 0
  const maxMonth = dateRange?.end.getMonth() || 11

  // 년도 목록 생성 (데이터 시작 년도 ~ 현재 년도)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).reverse()

  // 디버깅 로그
  console.log('DateFilterSelector 렌더링:', {
    actualDateRange,
    dateRange,
    minYear,
    maxYear,
    years,
    currentYear,
  })

  const handleTypeChange = (type: DateFilterType) => {
    const newFilter: DateFilterState = { type }

    // 기본값 설정
    switch (type) {
      case 'month':
        newFilter.selectedYear = currentYear
        newFilter.selectedMonth = currentMonth
        break
      case 'year':
        newFilter.selectedYearOnly = currentYear
        break
      case 'custom':
        if (dateRange) {
          newFilter.startYear = dateRange.start.getFullYear()
          newFilter.startMonth = dateRange.start.getMonth() + 1
          newFilter.endYear = currentYear
          newFilter.endMonth = currentMonth
        } else {
          newFilter.startYear = currentYear
          newFilter.startMonth = currentMonth
          newFilter.endYear = currentYear
          newFilter.endMonth = currentMonth
        }
        break
    }

    onChange(newFilter)
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">날짜 범위</Label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="dateFilter"
                checked={filter.type === 'all'}
                onChange={() => handleTypeChange('all')}
                className="h-4 w-4"
              />
              <span>전체</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="dateFilter"
                checked={filter.type === 'month'}
                onChange={() => handleTypeChange('month')}
                className="h-4 w-4"
              />
              <span>1달 단위</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="dateFilter"
                checked={filter.type === 'year'}
                onChange={() => handleTypeChange('year')}
                className="h-4 w-4"
              />
              <span>1년 단위</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="dateFilter"
                checked={filter.type === 'custom'}
                onChange={() => handleTypeChange('custom')}
                className="h-4 w-4"
              />
              <span>날짜 커스텀</span>
            </label>
          </div>
        </div>

        {/* 1달 단위 선택 */}
        {filter.type === 'month' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>년도</Label>
              <Select
                value={String(filter.selectedYear || currentYear)}
                onChange={(e) => onChange({ ...filter, selectedYear: Number(e.target.value) })}
              >
                {years.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}년
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>월</Label>
              <Select
                value={String(filter.selectedMonth || currentMonth)}
                onChange={(e) => onChange({ ...filter, selectedMonth: Number(e.target.value) })}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={String(month)}>
                    {month}월
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* 1년 단위 선택 */}
        {filter.type === 'year' && (
          <div>
            <Label>년도</Label>
            <Select
              value={String(filter.selectedYearOnly || currentYear)}
              onChange={(e) => onChange({ ...filter, selectedYearOnly: Number(e.target.value) })}
            >
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}년
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* 날짜 커스텀 선택 */}
        {filter.type === 'custom' && (
          <div className="space-y-4">
            <div>
              <Label>시작</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={String(filter.startYear || currentYear)}
                  onChange={(e) => onChange({ ...filter, startYear: Number(e.target.value) })}
                >
                  {years.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}년
                    </option>
                  ))}
                </Select>
                <Select
                  value={String(filter.startMonth || currentMonth)}
                  onChange={(e) => onChange({ ...filter, startMonth: Number(e.target.value) })}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={String(month)}>
                      {month}월
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>종료</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={String(filter.endYear || currentYear)}
                  onChange={(e) => onChange({ ...filter, endYear: Number(e.target.value) })}
                >
                  {years.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}년
                    </option>
                  ))}
                </Select>
                <Select
                  value={String(filter.endMonth || currentMonth)}
                  onChange={(e) => onChange({ ...filter, endMonth: Number(e.target.value) })}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={String(month)}>
                      {month}월
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* 데이터 범위 표시 */}
        {dateRange && (
          <p className="text-xs text-muted-foreground">
            데이터 범위: {dateRange.start.getFullYear()}-
            {String(dateRange.start.getMonth() + 1).padStart(2, '0')} ~{' '}
            {dateRange.end.getFullYear()}-{String(dateRange.end.getMonth() + 1).padStart(2, '0')}
          </p>
        )}
      </div>
    </Card>
  )
}
