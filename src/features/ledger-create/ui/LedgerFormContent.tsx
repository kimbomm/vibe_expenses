import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import type { Ledger } from '@/shared/types'

const ledgerSchema = z.object({
  name: z.string().min(1, '가계부 이름을 입력해주세요'),
  description: z.string().optional(),
  currency: z.string().min(1, '통화를 선택해주세요'),
})

type LedgerFormData = z.infer<typeof ledgerSchema>

interface LedgerFormContentProps {
  ledger?: Ledger
  onSubmit: (data: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>) => void
  onCancel: () => void
  showButtons?: boolean
}

export function LedgerFormContent({
  ledger,
  onSubmit,
  onCancel,
  showButtons = true,
}: LedgerFormContentProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LedgerFormData>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      name: ledger?.name || '',
      description: ledger?.description || '',
      currency: ledger?.currency || 'KRW',
    },
  })

  useEffect(() => {
    if (ledger) {
      reset({
        name: ledger.name,
        description: ledger.description || '',
        currency: ledger.currency,
      })
    } else {
      reset({
        name: '',
        description: '',
        currency: 'KRW',
      })
    }
  }, [ledger, reset])

  const onFormSubmit = (data: LedgerFormData) => {
    onSubmit({
      name: data.name,
      description: data.description,
      currency: data.currency,
    })
    onCancel()
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" id="ledger-form">
      {/* 가계부 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name">가계부 이름 *</Label>
        <Input id="name" {...register('name')} placeholder="예: 개인 가계부" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      {/* 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Input id="description" {...register('description')} placeholder="가계부 설명 (선택사항)" />
      </div>

      {/* 통화 */}
      <div className="space-y-2">
        <Label htmlFor="currency">통화 *</Label>
        <Select id="currency" {...register('currency')} disabled>
          <option value="USD">USD (달러)</option>
          <option value="KRW">KRW (원)</option>
          <option value="JPY">JPY (엔)</option>
          <option value="EUR">EUR (유로)</option>
        </Select>
        {errors.currency && <p className="text-sm text-red-500">{errors.currency.message}</p>}
      </div>

      {showButtons && (
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            취소
          </Button>
          <Button type="submit" className="flex-1">
            {ledger ? '수정' : '추가'}
          </Button>
        </div>
      )}
    </form>
  )
}
