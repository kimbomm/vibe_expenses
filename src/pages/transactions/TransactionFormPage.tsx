import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { TransactionFormContent } from '@/components/transaction/TransactionFormContent'
import { useMockDataStore } from '@/stores/mockDataStore'
import type { Transaction } from '@/types'

export function TransactionFormPage() {
  const { ledgerId, transactionId } = useParams<{
    ledgerId: string
    transactionId?: string
  }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { transactions, addTransaction, updateTransaction } = useMockDataStore()

  // transactionId가 있으면 수정 모드
  const transaction = transactionId ? transactions.find((t) => t.id === transactionId) : undefined

  if (!ledgerId) {
    return <div>가계부를 선택해주세요.</div>
  }

  const handleSubmit = (
    data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>
  ) => {
    if (transaction) {
      updateTransaction(transaction.id, data)
    } else {
      addTransaction(data)
    }
    // 이전 페이지로 이동
    const returnPath = location.state?.returnPath || `/ledgers/${ledgerId}/transactions`
    navigate(returnPath)
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
