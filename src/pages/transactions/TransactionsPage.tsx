import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Trash2,
  Upload,
  Download,
  Copy,
} from 'lucide-react'
import { isSameDay, format } from 'date-fns'
import { useTransactionStore } from '@/stores/transactionStore'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useAuthStore } from '@/stores/authStore'
import { useLedgerPermission } from '@/hooks/useLedgerPermission'
import { formatCurrency, formatDateString } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CalendarView } from '@/components/transaction/CalendarView'
import { TransactionForm } from '@/components/transaction/TransactionForm'
import { ImportTransactionModal } from '@/components/import/ImportTransactionModal'
import { ExportTransactionModal } from '@/components/export/ExportTransactionModal'
import type { Transaction } from '@/types'

export function TransactionsPage() {
  const { ledgerId } = useParams()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [defaultDate, setDefaultDate] = useState<Date | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
  const [defaultTransaction, setDefaultTransaction] = useState<Transaction | undefined>()

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
  const currentLedger = useLedgerStore((state) =>
    ledgerId ? (state.ledgers.find((l) => l.id === ledgerId) ?? null) : null
  )

  // 작성자 정보 가져오기
  const getCreatorInfo = (userId: string) => {
    if (!currentLedger) return null

    // 가계부 소유자인 경우
    if (currentLedger.ownerId === userId) {
      const ownerMember = currentLedger.members.find((m) => m.userId === currentLedger.ownerId)
      return ownerMember || { name: '소유자', email: '' }
    }

    // 멤버인 경우
    const member = currentLedger.members.find((m) => m.userId === userId)
    return member || null
  }

  // 필터용 멤버 목록 (소유자 + 멤버)
  const filterMembers = useMemo(() => {
    if (!currentLedger) return []

    const members: Array<{ userId: string; name: string; isOwner: boolean }> = []

    // 소유자 추가
    const ownerMember = currentLedger.members.find((m) => m.userId === currentLedger.ownerId)
    if (ownerMember) {
      members.push({
        userId: currentLedger.ownerId,
        name: ownerMember.name,
        isOwner: true,
      })
    }

    // 일반 멤버 추가 (소유자 제외)
    currentLedger.members.forEach((member) => {
      if (member.userId !== currentLedger.ownerId) {
        members.push({
          userId: member.userId,
          name: member.name,
          isOwner: false,
        })
      }
    })

    return members
  }, [currentLedger])

  // ledgerId 변경 시 필터 초기화
  const prevLedgerIdRef = useRef<string | undefined>(ledgerId)
  useEffect(() => {
    if (prevLedgerIdRef.current !== ledgerId && prevLedgerIdRef.current !== undefined) {
      setSelectedUserId(null)
    }
    prevLedgerIdRef.current = ledgerId
  }, [ledgerId])

  // 가계부별 거래내역 조회 (페이지 마운트 시, 월별 조회)
  useEffect(() => {
    if (!ledgerId || !currentLedger?.encryptionKey) return

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1
    fetchTransactionsByMonth(ledgerId, year, month)
  }, [ledgerId, currentMonth, fetchTransactionsByMonth, currentLedger?.encryptionKey])

  // 필터링된 거래 목록 (캘린더용) - currentMonth + 작성자 기준으로 필터링
  const allFilteredTransactions = useMemo(() => {
    if (!ledgerId) return []

    return storeTransactions.filter((t) => {
      const transactionDate = new Date(t.date)
      const monthMatch =
        transactionDate.getFullYear() === currentMonth.getFullYear() &&
        transactionDate.getMonth() === currentMonth.getMonth()

      // 작성자 필터 적용
      const userMatch = selectedUserId === null || t.createdBy === selectedUserId

      return monthMatch && userMatch
    })
  }, [ledgerId, currentMonth, storeTransactions, selectedUserId])

  // 선택된 날짜의 거래 목록 (날짜 클릭 시)
  const transactions = useMemo(() => {
    if (selectedDate) {
      return allFilteredTransactions
        .filter((t) => isSameDay(new Date(t.date), selectedDate))
        .sort((a, b) => b.date.getTime() - a.date.getTime())
    }
    return allFilteredTransactions.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [allFilteredTransactions, selectedDate])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">거래 내역</h1>
          <p className="mt-1 text-muted-foreground">수입과 지출을 기록하세요</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {canEdit && (
            <>
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => {
                  setEditingTransaction(undefined)
                  setDefaultTransaction(undefined)
                  // selectedDate가 있으면 그것을 기본값으로 사용, 없으면 오늘 날짜
                  if (selectedDate) {
                    setDefaultDate(selectedDate)
                  } else {
                    setDefaultDate(new Date())
                  }
                  setFormOpen(true)
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                거래 추가
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setImportOpen(true)
                }}
              >
                <Upload className="mr-2 h-5 w-5" />
                일괄 업로드
              </Button>
            </>
          )}
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              setExportOpen(true)
            }}
          >
            <Download className="mr-2 h-5 w-5" />
            내보내기
          </Button>
        </div>
      </div>

      {/* 작성자 필터 */}
      {currentLedger && filterMembers.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <Label htmlFor="user-filter" className="text-sm font-medium">
            작성자 필터
          </Label>
          <Select
            id="user-filter"
            value={selectedUserId || ''}
            onChange={(e) => {
              setSelectedUserId(e.target.value === '' ? null : e.target.value)
            }}
            className="w-full sm:w-[200px]"
          >
            <option value="">전체</option>
            {filterMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
                {member.isOwner && ' (소유자)'}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* 캘린더 뷰 또는 리스트 뷰 */}
      {!selectedDate ? (
        <div className="-mx-4 md:mx-0">
          <CalendarView
            transactions={allFilteredTransactions}
            currentDate={currentMonth}
            onDateChange={(date) => {
              setCurrentMonth(date)
            }}
            onDateClick={(date) => {
              setSelectedDate(date)
              setDefaultDate(date) // 날짜 클릭 시 기본 날짜로 저장
            }}
          />
        </div>
      ) : (
        <>
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
          {/* 거래 목록 */}
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">선택한 조건에 맞는 거래 내역이 없습니다.</p>
              </Card>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="relative p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
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
                        {transaction.memo && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            {transaction.memo}
                          </div>
                        )}
                        {transaction.createdBy && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            {(() => {
                              const creator = getCreatorInfo(transaction.createdBy)
                              if (!creator) return null
                              return (
                                <>
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                                    {creator.name.charAt(0)}
                                  </div>
                                  <span>{creator.name}</span>
                                </>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-2">
                      <div className="flex-shrink-0 text-right">
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
                      {canEdit && transaction.createdBy === user?.uid && (
                        <div className="flex items-center gap-1 sm:flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => {
                              setEditingTransaction(transaction)
                              setDefaultTransaction(undefined)
                              setFormOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={() => {
                              setDefaultTransaction(transaction)
                              setEditingTransaction(undefined)
                              setFormOpen(true)
                            }}
                            title="복사"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-10 sm:w-10"
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
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* 거래 추가/수정 폼 */}
      {ledgerId && (
        <>
          <TransactionForm
            open={formOpen}
            onOpenChange={(open) => {
              setFormOpen(open)
              if (!open) {
                // 폼이 닫힐 때 defaultDate, defaultTransaction 초기화
                setDefaultDate(null)
                setDefaultTransaction(undefined)
              }
            }}
            ledgerId={ledgerId}
            transaction={editingTransaction}
            defaultTransaction={defaultTransaction}
            defaultDate={defaultDate}
            onSubmit={async (data) => {
              if (!user) return

              try {
                if (editingTransaction) {
                  await updateTransaction(editingTransaction.id, data, user.uid)
                } else {
                  await addTransaction(data, user.uid)
                }

                // 저장된 거래의 날짜로 이동
                const savedDate = data.date instanceof Date ? data.date : new Date(data.date)
                setSelectedDate(savedDate)
                setCurrentMonth(new Date(savedDate.getFullYear(), savedDate.getMonth(), 1))

                // 해당 월의 거래내역 다시 조회
                const year = savedDate.getFullYear()
                const month = savedDate.getMonth() + 1
                fetchTransactionsByMonth(ledgerId, year, month)

                setFormOpen(false)
                setEditingTransaction(undefined)
                setDefaultTransaction(undefined)
                setDefaultDate(null)
              } catch (error) {
                console.error('거래 저장 실패:', error)
                alert('거래 저장에 실패했습니다.')
              }
            }}
          />
          <ImportTransactionModal
            open={importOpen}
            onOpenChange={setImportOpen}
            ledgerId={ledgerId}
          />
          <ExportTransactionModal
            open={exportOpen}
            onOpenChange={setExportOpen}
            ledgerId={ledgerId}
          />
        </>
      )}
    </div>
  )
}
