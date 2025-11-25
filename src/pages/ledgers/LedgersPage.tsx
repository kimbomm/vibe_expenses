import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Wallet, Users, Edit, Trash2 } from 'lucide-react'
import { useMockDataStore } from '@/stores/mockDataStore'
import { formatDateString } from '@/lib/utils'
import { LedgerForm } from '@/components/ledger/LedgerForm'
import type { Ledger } from '@/types'

export function LedgersPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingLedger, setEditingLedger] = useState<Ledger | undefined>()

  const { ledgers, addLedger, updateLedger, deleteLedger } = useMockDataStore()

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ledgers.map((ledger) => (
          <Card key={ledger.id} className="relative transition-shadow hover:shadow-lg">
            <CardHeader>
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
              <p className="text-sm text-muted-foreground">{ledger.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{ledger.members.length}명의 멤버</span>
              </div>
              <div className="text-xs text-muted-foreground">
                생성일: {formatDateString(ledger.createdAt)}
              </div>
              <Link to={`/ledgers/${ledger.id}/transactions`}>
                <Button className="w-full">보기</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 가계부 추가/수정 폼 */}
      <LedgerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        ledger={editingLedger}
        onSubmit={(data) => {
          if (editingLedger) {
            updateLedger(editingLedger.id, data)
          } else {
            addLedger(data)
          }
        }}
      />
    </div>
  )
}
