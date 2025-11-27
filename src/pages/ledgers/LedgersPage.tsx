import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Wallet, Users, Edit, Trash2, Settings2 } from 'lucide-react'
import { useLedgerStore } from '@/stores/ledgerStore'
import { useAuthStore } from '@/stores/authStore'
import { formatDateString } from '@/lib/utils'
import { LedgerForm } from '@/components/ledger/LedgerForm'
import type { Ledger } from '@/types'

export function LedgersPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingLedger, setEditingLedger] = useState<Ledger | undefined>()

  const { user } = useAuthStore()
  const { ledgers, loading, addLedger, updateLedger, deleteLedger, fetchLedgers } = useLedgerStore()

  // 사용자 로그인 시 가계부 조회 (페이지 마운트 시 및 포커스 시)
  useEffect(() => {
    if (!user?.uid) return

    // 초기 로드
    fetchLedgers(user.uid)

    // 페이지 포커스 시 다시 조회
    const handleFocus = () => {
      fetchLedgers(user.uid)
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">가계부</h1>
          <p className="mt-1 text-muted-foreground">나의 가계부를 관리하세요</p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto"
          onClick={() => {
            setEditingLedger(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="mr-2 h-5 w-5" />
          가계부 만들기
        </Button>
      </div>

      {loading && <div className="text-center text-muted-foreground">가계부를 불러오는 중...</div>}

      {!loading && ledgers.length === 0 && (
        <div className="text-center text-muted-foreground">
          <p className="mb-4">아직 생성된 가계부가 없습니다.</p>
          <Button
            onClick={() => {
              setEditingLedger(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="mr-2 h-5 w-5" />첫 가계부 만들기
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ledgers.map((ledger) => (
          <Card
            key={ledger.id}
            className="relative flex flex-col transition-shadow hover:shadow-lg"
          >
            <CardHeader className="flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingLedger(ledger)
                      setFormOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('정말 삭제하시겠습니까?')) {
                        deleteLedger(ledger.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4">{ledger.name}</CardTitle>
              {ledger.description && (
                <p className="text-sm text-muted-foreground">{ledger.description}</p>
              )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="flex-1" />
              <div className="mt-auto space-y-3">
                <div className="flex flex-col items-end gap-2 text-right">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{ledger.members.length}명의 멤버</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    생성일: {formatDateString(ledger.createdAt)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/ledgers/${ledger.id}/transactions`} className="flex-1">
                    <Button className="w-full">보기</Button>
                  </Link>
                  <Link to={`/ledgers/${ledger.id}/settings/categories`}>
                    <Button variant="outline" size="icon" title="카테고리 설정">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 가계부 추가/수정 폼 */}
      <LedgerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        ledger={editingLedger}
        onSubmit={async (data) => {
          if (!user) return

          try {
            if (editingLedger) {
              await updateLedger(editingLedger.id, data)
            } else {
              await addLedger(data, user.uid, user.email || '', user.displayName || '')
            }
            setFormOpen(false)
            setEditingLedger(undefined)
          } catch (error) {
            console.error('가계부 저장 실패:', error)
            alert('가계부 저장에 실패했습니다.')
          }
        }}
      />
    </div>
  )
}
