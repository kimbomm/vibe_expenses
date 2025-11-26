import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LedgerFormContent } from '@/components/ledger/LedgerFormContent'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useAuthStore } from '@/stores/authStore'
import type { Ledger } from '@/types'

export function LedgerFormPage() {
  const { ledgerId } = useParams<{ ledgerId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { ledgers, subscribeLedgers, unsubscribeLedgers, addLedger, updateLedger } =
    useLedgerStore()

  // 사용자 로그인 시 가계부 구독
  useEffect(() => {
    if (user) {
      subscribeLedgers(user.uid)
      return () => {
        unsubscribeLedgers()
      }
    }
  }, [user, subscribeLedgers, unsubscribeLedgers])

  // ledgerId가 있으면 수정 모드
  const ledger = ledgerId ? ledgers.find((l) => l.id === ledgerId) : undefined

  const handleSubmit = async (
    data: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>
  ) => {
    if (!user) return

    try {
      if (ledger) {
        await updateLedger(ledger.id, data)
      } else {
        await addLedger(data, user.uid, user.email || '', user.displayName || '')
      }
      // 이전 페이지로 이동
      const returnPath = location.state?.returnPath || '/ledgers'
      navigate(returnPath)
    } catch (error) {
      console.error('가계부 저장 실패:', error)
      alert('가계부 저장에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    const returnPath = location.state?.returnPath || '/ledgers'
    navigate(returnPath)
  }

  return (
    <div className="flex h-screen flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-4 border-b bg-background p-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{ledger ? '가계부 수정' : '가계부 추가'}</h2>
      </div>
      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <LedgerFormContent
          ledger={ledger}
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
              const form = document.getElementById('ledger-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            className="flex-1"
          >
            {ledger ? '수정' : '추가'}
          </Button>
        </div>
      </div>
    </div>
  )
}
