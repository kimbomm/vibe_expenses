import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { TransactionFormContent } from '@/components/transaction/TransactionFormContent'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'
import type { Transaction } from '@/types'

export function TransactionFormPage() {
  const { ledgerId, transactionId } = useParams<{
    ledgerId: string
    transactionId?: string
  }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  // 빈 배열을 상수로 정의하여 같은 참조를 유지
  const EMPTY_ARRAY: Transaction[] = []

  const transactions = useTransactionStore((state) => {
    if (!ledgerId) return EMPTY_ARRAY
    return state.transactions[ledgerId] || EMPTY_ARRAY
  })
  const fetchTransactionsByMonth = useTransactionStore((state) => state.fetchTransactionsByMonth)
  const addTransaction = useTransactionStore((state) => state.addTransaction)
  const updateTransaction = useTransactionStore((state) => state.updateTransaction)

  // 가계부별 거래내역 조회 (페이지 마운트 시 및 포커스 시)
  // 수정 모드인 경우 해당 거래의 월을 조회, 아니면 현재 월 조회
  useEffect(() => {
    if (!ledgerId) return

    let year: number, month: number
    if (transactionId && transaction) {
      // 수정 모드: 해당 거래의 월
      year = transaction.date.getFullYear()
      month = transaction.date.getMonth() + 1
    } else {
      // 추가 모드: 현재 월
      const now = new Date()
      year = now.getFullYear()
      month = now.getMonth() + 1
    }

    fetchTransactionsByMonth(ledgerId, year, month)

    // 페이지 포커스 시 다시 조회
    const handleFocus = () => {
      fetchTransactionsByMonth(ledgerId, year, month)
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, transactionId, transaction])

  // transactionId가 있으면 수정 모드
  const transaction = transactionId ? transactions.find((t) => t.id === transactionId) : undefined

  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  const handleSubmit = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>
  ) => {
    if (!user) return

    try {
      if (transaction) {
        await updateTransaction(transaction.id, data, user.uid)
      } else {
        await addTransaction(data, user.uid)
      }
      // 이전 페이지로 이동
      const returnPath = location.state?.returnPath || `/ledgers/${ledgerId}/transactions`
      navigate(returnPath)
    } catch (error) {
      console.error('거래 저장 실패:', error)
      alert('거래 저장에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    const returnPath = location.state?.returnPath || `/ledgers/${ledgerId}/transactions`
    navigate(returnPath)
  }

  return (
    <div className="flex h-screen flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-4 border-b bg-background p-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{transaction ? '거래 수정' : '거래 추가'}</h2>
      </div>
      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <TransactionFormContent
          ledgerId={ledgerId}
          transaction={transaction}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          showButtons={false}
        />
      </div>
      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 md:hidden">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
            취소
          </Button>
          <Button
            type="button"
            onClick={() => {
              const form = document.getElementById('transaction-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            className="flex-1"
          >
            {transaction ? '수정' : '추가'}
          </Button>
        </div>
      </div>
    </div>
  )
}
