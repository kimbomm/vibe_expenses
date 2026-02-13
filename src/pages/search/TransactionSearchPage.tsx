import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/entities/user/model/store'
import { useLedgerStore } from '@/entities/ledger/model/store'
import { useCategoryStore } from '@/entities/category/model/store'
import { getTransactionsByLedgerAndMonths } from '@/entities/transaction/api/transactionApi'
import { decryptTransactions } from '@/entities/transaction/lib/transactionCrypto'
import { formatCurrency, formatDateString } from '@/shared/lib/utils'
import { generateMonthKeys } from '@/shared/lib/export/dateUtils'
import type { Transaction, TransactionType } from '@/shared/types'

type PeriodType = 'recent3' | 'recent12' | 'custom'

function normalizeText(value?: string): string {
  return (value || '').toLowerCase().trim()
}

function buildRecentMonthKeys(monthCount: number): string[] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1), 1)
  return generateMonthKeys(
    start.getFullYear(),
    start.getMonth() + 1,
    now.getFullYear(),
    now.getMonth() + 1
  )
}

export function TransactionSearchPage() {
  const [searchParams] = useSearchParams()
  const initialLedgerId = searchParams.get('ledgerId')

  const { user } = useAuthStore()
  const { ledgers, fetchLedgers } = useLedgerStore()
  const fetchCategories = useCategoryStore((state) => state.fetchCategories)

  const [ledgerId, setLedgerId] = useState('')
  const [query, setQuery] = useState('')
  const [periodType, setPeriodType] = useState<PeriodType>('recent3')
  const [customStartMonth, setCustomStartMonth] = useState('')
  const [customEndMonth, setCustomEndMonth] = useState('')

  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [category1Filter, setCategory1Filter] = useState('all')
  const [category2Filter, setCategory2Filter] = useState('all')
  const [payment1Filter, setPayment1Filter] = useState('all')
  const [payment2Filter, setPayment2Filter] = useState('all')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  const ledgerCategories = useCategoryStore((state) =>
    ledgerId ? state.categories[ledgerId] : undefined
  )

  useEffect(() => {
    if (!user?.uid) return
    fetchLedgers(user.uid)
  }, [user?.uid, fetchLedgers])

  useEffect(() => {
    if (ledgerId) return

    const lastLedgerId = typeof window !== 'undefined' ? localStorage.getItem('lastLedgerId') : null
    const nextLedgerId = initialLedgerId || lastLedgerId || ledgers[0]?.id || ''

    if (nextLedgerId) {
      setLedgerId(nextLedgerId)
    }
  }, [initialLedgerId, ledgers, ledgerId])

  useEffect(() => {
    const now = new Date()
    const endMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const startMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`
    setCustomStartMonth(startMonth)
    setCustomEndMonth(endMonth)
  }, [])

  useEffect(() => {
    if (!ledgerId) return
    fetchCategories(ledgerId)
  }, [ledgerId, fetchCategories])

  const category1Options = useMemo(() => {
    if (!ledgerCategories) return []

    if (typeFilter === 'income') {
      return Object.keys(ledgerCategories.income)
    }

    if (typeFilter === 'expense') {
      return Object.keys(ledgerCategories.expense)
    }

    return Array.from(
      new Set([...Object.keys(ledgerCategories.income), ...Object.keys(ledgerCategories.expense)])
    )
  }, [ledgerCategories, typeFilter])

  const category2Options = useMemo(() => {
    if (!ledgerCategories || category1Filter === 'all') return []

    const incomeOptions = ledgerCategories.income[category1Filter] || []
    const expenseOptions = ledgerCategories.expense[category1Filter] || []
    return Array.from(new Set([...incomeOptions, ...expenseOptions]))
  }, [ledgerCategories, category1Filter])

  const payment1Options = useMemo(() => {
    if (!ledgerCategories) return []
    return Object.keys(ledgerCategories.payment)
  }, [ledgerCategories])

  const payment2Options = useMemo(() => {
    if (!ledgerCategories || payment1Filter === 'all') return []
    return ledgerCategories.payment[payment1Filter] || []
  }, [ledgerCategories, payment1Filter])

  useEffect(() => {
    setCategory2Filter('all')
  }, [category1Filter])

  useEffect(() => {
    setPayment2Filter('all')
  }, [payment1Filter])

  const activeAdvancedFilterCount = [
    typeFilter !== 'all',
    category1Filter !== 'all',
    category2Filter !== 'all',
    payment1Filter !== 'all',
    payment2Filter !== 'all',
  ].filter(Boolean).length

  const resetFilters = () => {
    setQuery('')
    setTypeFilter('all')
    setCategory1Filter('all')
    setCategory2Filter('all')
    setPayment1Filter('all')
    setPayment2Filter('all')
  }

  const runSearch = async () => {
    if (!ledgerId) {
      setError('검색할 가계부를 선택해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let monthKeys: string[] = []

      if (periodType === 'recent3') {
        monthKeys = buildRecentMonthKeys(3)
      } else if (periodType === 'recent12') {
        monthKeys = buildRecentMonthKeys(12)
      } else {
        if (!customStartMonth || !customEndMonth) {
          throw new Error('시작월과 종료월을 선택해주세요.')
        }

        const [startYear, startMonth] = customStartMonth.split('-').map(Number)
        const [endYear, endMonth] = customEndMonth.split('-').map(Number)
        const startDate = new Date(startYear, startMonth - 1, 1)
        const endDate = new Date(endYear, endMonth - 1, 1)

        if (startDate > endDate) {
          throw new Error('시작월은 종료월보다 같거나 빨라야 합니다.')
        }

        monthKeys = generateMonthKeys(startYear, startMonth, endYear, endMonth)
      }

      let transactions = await getTransactionsByLedgerAndMonths(ledgerId, monthKeys)

      const ledger = ledgers.find((l) => l.id === ledgerId)
      if (ledger?.encryptionKey) {
        transactions = await decryptTransactions(transactions, ledger.encryptionKey)
      }

      const normalizedQuery = normalizeText(query)

      const filtered = transactions
        .filter((transaction) => {
          if (typeFilter !== 'all' && transaction.type !== typeFilter) return false
          if (category1Filter !== 'all' && transaction.category1 !== category1Filter) return false
          if (category2Filter !== 'all' && transaction.category2 !== category2Filter) return false
          if (payment1Filter !== 'all' && transaction.paymentMethod1 !== payment1Filter) return false
          if (payment2Filter !== 'all' && transaction.paymentMethod2 !== payment2Filter) return false

          if (!normalizedQuery) return true

          const searchableText = normalizeText(
            [
              transaction.description,
              transaction.memo,
              transaction.category1,
              transaction.category2,
              transaction.paymentMethod1,
              transaction.paymentMethod2,
            ]
              .filter(Boolean)
              .join(' ')
          )

          return searchableText.includes(normalizedQuery)
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime())

      setResults(filtered)
      setSearched(true)
    } catch (searchError) {
      console.error('거래 검색 실패:', searchError)
      setError(searchError instanceof Error ? searchError.message : '검색 중 오류가 발생했습니다.')
      setResults([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-gradient-to-r from-emerald-50 via-background to-cyan-50 p-5">
        <h1 className="text-2xl font-bold sm:text-3xl">거래 검색</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          키워드와 기간으로 빠르게 찾고, 필요할 때만 상세 필터를 여세요.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>가계부</Label>
            <Select value={ledgerId} onChange={(e) => setLedgerId(e.target.value)}>
              {ledgers.map((ledger) => (
                <option key={ledger.id} value={ledger.id}>
                  {ledger.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label>기간</Label>
            <Select value={periodType} onChange={(e) => setPeriodType(e.target.value as PeriodType)}>
              <option value="recent3">최근 3개월</option>
              <option value="recent12">최근 12개월</option>
              <option value="custom">직접 선택</option>
            </Select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label>검색어</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 택시, 점심, 카카오페이"
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    runSearch()
                  }
                }}
              />
            </div>
          </div>

          {periodType === 'custom' && (
            <>
              <div className="space-y-1">
                <Label>시작월</Label>
                <Input
                  type="month"
                  value={customStartMonth}
                  onChange={(e) => setCustomStartMonth(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>종료월</Label>
                <Input
                  type="month"
                  value={customEndMonth}
                  onChange={(e) => setCustomEndMonth(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground'
              )}
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              <span className="flex items-center gap-2 font-medium">
                상세 검색
                {activeAdvancedFilterCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {activeAdvancedFilterCount}
                  </span>
                )}
              </span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {showAdvanced && (
            <>
              <div className="space-y-1">
                <Label>타입</Label>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | TransactionType)}
                >
                  <option value="all">전체</option>
                  <option value="income">수입</option>
                  <option value="expense">지출</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>카테고리(1단계)</Label>
                <Select value={category1Filter} onChange={(e) => setCategory1Filter(e.target.value)}>
                  <option value="all">전체</option>
                  {category1Options.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <Label>카테고리(2단계)</Label>
                <Select value={category2Filter} onChange={(e) => setCategory2Filter(e.target.value)}>
                  <option value="all">전체</option>
                  {category2Options.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <Label>결제수단(1단계)</Label>
                <Select value={payment1Filter} onChange={(e) => setPayment1Filter(e.target.value)}>
                  <option value="all">전체</option>
                  {payment1Options.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label>결제수단(2단계)</Label>
                <Select value={payment2Filter} onChange={(e) => setPayment2Filter(e.target.value)}>
                  <option value="all">전체</option>
                  {payment2Options.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button className="sm:min-w-[140px]" onClick={runSearch} disabled={loading || !ledgerId}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                검색 실행
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetFilters}>
            필터 초기화
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {searched && !loading && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">검색 결과</h2>
            <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
              {results.length}건
            </span>
          </div>

          {results.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              조건에 맞는 거래가 없습니다.
            </div>
          )}

          {results.map((transaction) => (
            <article key={transaction.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{transaction.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateString(transaction.date)} · {transaction.category1} &gt; {transaction.category2}
                  </p>
                  {(transaction.paymentMethod1 || transaction.paymentMethod2) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      결제수단: {transaction.paymentMethod1 || '미지정'}
                      {transaction.paymentMethod2 ? ` > ${transaction.paymentMethod2}` : ''}
                    </p>
                  )}
                  {transaction.memo && (
                    <p className="mt-2 rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground">
                      메모: {transaction.memo}
                    </p>
                  )}
                </div>
                <p
                  className={cn(
                    'shrink-0 text-sm font-semibold sm:text-base',
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
