import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowUpRight, ArrowDownRight, Calendar, List, Edit, Trash2 } from 'lucide-react'
import { startOfWeek, endOfWeek, isSameDay, format } from 'date-fns'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'
import { useLedgerPermission } from '@/hooks/useLedgerPermission'
import { formatCurrency, formatDateString } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CalendarView } from '@/components/transaction/CalendarView'
import { TransactionForm } from '@/components/transaction/TransactionForm'
import type { Transaction } from '@/types'

type DateFilter = 'day' | 'week' | 'month' | null

export function TransactionsPage() {
  const { ledgerId } = useParams()
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()

  const { user } = useAuthStore()
  const { canEdit } = useLedgerPermission(ledgerId)

  // 빈 배열을 상수로 정의하여 같은 참조를 유지
  const EMPTY_ARRAY: Transaction[] = []

  const storeTransactions = useTransactionStore((state) => {
    if (!ledgerId) return EMPTY_ARRAY
    return state.transactions[ledgerId] || EMPTY_ARRAY
  })
  const fetchTransactionsByMonth = useTransactionStore((state) => state.fetchTransactionsByMonth)
  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const updateTransaction = useTransactionStore((state) => state.updateTransaction)
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction)

  // 가계부별 거래내역 조회 (페이지 마운트 시, 월별 조회)
  useEffect(() => {
    if (!ledgerId) return

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1
    fetchTransactionsByMonth(ledgerId, year, month)
  }, [ledgerId, currentMonth, fetchTransactionsByMonth])

  // 필터링된 거래 목록 (캘린더용)
  const allFilteredTransactions = useMemo(() => {
    if (!ledgerId) return []
    let filtered = storeTransactions

    // 타입 필터
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    // 날짜 필터
    if (dateFilter !== null) {
      const now = new Date()
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)

        switch (dateFilter) {
          case 'day':
            return isSameDay(transactionDate, now)
          case 'week': {
            const weekStart = startOfWeek(now, { weekStartsOn: 0 })
            const weekEnd = endOfWeek(now, { weekStartsOn: 0 })
            return transactionDate >= weekStart && transactionDate <= weekEnd
          }
          case 'month':
            return (
              transactionDate.getFullYear() === now.getFullYear() &&
              transactionDate.getMonth() === now.getMonth()
            )
          default:
            return true
        }
      })
    } else {
      // 필터가 없을 때는 currentMonth 기준으로 필터링
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)
        return (
          transactionDate.getFullYear() === currentMonth.getFullYear() &&
          transactionDate.getMonth() === currentMonth.getMonth()
        )
      })
    }

    return filtered
  }, [ledgerId, typeFilter, dateFilter, currentMonth, storeTransactions])

  // 선택된 날짜의 거래 목록 (일 단위 필터 또는 날짜 클릭 시)
  const transactions = useMemo(() => {
    if (dateFilter === 'day' || selectedDate) {
      const targetDate = selectedDate || new Date()
      return allFilteredTransactions
        .filter((t) => isSameDay(new Date(t.date), targetDate))
        .sort((a, b) => b.date.getTime() - a.date.getTime())
    }
    return allFilteredTransactions.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [allFilteredTransactions, dateFilter, selectedDate])

  // 주 단위 필터 선택 시 해당 주의 시작일
  const selectedWeekStart = useMemo(() => {
    if (dateFilter === 'week') {
      return startOfWeek(new Date(), { weekStartsOn: 0 })
    }
    return null
  }, [dateFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">거래 내역</h1>
          <p className="mt-1 text-muted-foreground">수입과 지출을 기록하세요</p>
        </div>
        {canEdit && (
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => {
              setEditingTransaction(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            거래 추가
          </Button>
        )}
      </div>

      {/* 필터 */}
      <div className="space-y-3">
        {/* 타입 필터 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">타입:</span>
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            전체
          </Button>
          <Button
            variant={typeFilter === 'income' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('income')}
          >
            수입
          </Button>
          <Button
            variant={typeFilter === 'expense' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('expense')}
          >
            지출
          </Button>
        </div>

        {/* 날짜 필터 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">기간:</span>
          <Button
            variant={dateFilter === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setDateFilter('month')
              setSelectedDate(null)
              setCurrentMonth(new Date()) // 현재 월로 리셋
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            이번 달
          </Button>
          <Button
            variant={dateFilter === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setDateFilter('week')
              setSelectedDate(null)
              setCurrentMonth(new Date()) // 현재 월로 리셋
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            이번 주
          </Button>
          <Button
            variant={dateFilter === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setDateFilter('day')
              setSelectedDate(new Date())
              setCurrentMonth(new Date()) // 현재 월로 리셋
            }}
          >
            <List className="mr-2 h-4 w-4" />
            오늘
          </Button>
        </div>
      </div>

      {/* 캘린더 뷰 (월/주 필터) 또는 리스트 뷰 (일 필터) */}
      {(dateFilter === 'month' || dateFilter === 'week' || dateFilter === null) && !selectedDate ? (
        <CalendarView
          transactions={allFilteredTransactions}
          currentDate={currentMonth}
          onDateChange={(date) => {
            setCurrentMonth(date)
            setDateFilter(null) // 월 조정 시 필터 비활성화
          }}
          selectedWeek={selectedWeekStart}
          onDateClick={(date) => {
            setSelectedDate(date)
          }}
        />
      ) : (
        <>
          {selectedDate && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <h3 className="font-semibold">{format(selectedDate, 'yyyy년 M월 d일')} 거래 내역</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(null)
                }}
              >
                캘린더로 돌아가기
              </Button>
            </div>
          )}
          {dateFilter === 'day' && !selectedDate && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-3">
              <h3 className="font-semibold">오늘 거래 내역</h3>
            </div>
          )}
          {/* 거래 목록 */}
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">선택한 조건에 맞는 거래 내역이 없습니다.</p>
              </Card>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="relative p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div
                        className={cn(
                          'flex-shrink-0 rounded-lg p-2',
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        )}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{transaction.description}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.category1}</span>
                          <span>·</span>
                          <span>{transaction.category2}</span>
                          {transaction.paymentMethod1 && (
                            <>
                              <span>·</span>
                              <span>{transaction.paymentMethod1}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-shrink-0 text-left sm:text-right">
                        <div
                          className={cn(
                            'text-lg font-bold',
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateString(transaction.date)}
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingTransaction(transaction)
                              setFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              if (confirm('정말 삭제하시겠습니까?')) {
                                try {
                                  await deleteTransaction(transaction.id)
                                } catch (error) {
                                  console.error('거래 삭제 실패:', error)
                                  alert('거래 삭제에 실패했습니다.')
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {transaction.memo && (
                    <div className="mt-3 pl-14 text-sm text-muted-foreground">
                      {transaction.memo}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* 거래 추가/수정 폼 */}
      {ledgerId && (
        <TransactionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          ledgerId={ledgerId}
          transaction={editingTransaction}
          onSubmit={async (data) => {
            if (!user) return

            try {
              if (editingTransaction) {
                await updateTransaction(editingTransaction.id, data, user.uid)
              } else {
                await addTransaction(data, user.uid)
              }
              setFormOpen(false)
              setEditingTransaction(undefined)
            } catch (error) {
              console.error('거래 저장 실패:', error)
              alert('거래 저장에 실패했습니다.')
            }
          }}
        />
      )}
    </div>
  )
}
