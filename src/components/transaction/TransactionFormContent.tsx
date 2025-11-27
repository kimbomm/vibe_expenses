import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import type { Transaction } from '@/types'
import { formatDateString, formatNumber } from '@/lib/utils'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(1, '금액을 입력해주세요'),
  date: z.string(),
  category1: z.string().min(1, '카테고리를 선택해주세요'),
  category2: z.string().min(1, '카테고리를 선택해주세요'),
  paymentMethod1: z.string().optional(),
  paymentMethod2: z.string().optional(),
  description: z.string().min(1, '내역을 입력해주세요'),
  memo: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormContentProps {
  ledgerId: string
  transaction?: Transaction
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>) => void
  onCancel: () => void
  showButtons?: boolean
}

export function TransactionFormContent({
  ledgerId,
  transaction,
  onSubmit,
  onCancel,
  showButtons = true,
}: TransactionFormContentProps) {
  const {
    getIncomeCategory1List,
    getIncomeCategory2List,
    getExpenseCategory1List,
    getExpenseCategory2List,
    getPaymentMethod1List,
    getPaymentMethod2List,
  } = useCategories(ledgerId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount || 0,
      date: transaction ? formatDateString(transaction.date) : formatDateString(new Date()),
      category1: transaction?.category1 || '',
      category2: transaction?.category2 || '',
      paymentMethod1: transaction?.paymentMethod1 || '',
      paymentMethod2: transaction?.paymentMethod2 || '',
      description: transaction?.description || '',
      memo: transaction?.memo || '',
    },
  })

  const type = watch('type')
  const category1 = watch('category1')
  const paymentMethod1 = watch('paymentMethod1')

  // 금액 표시용 상태 (포맷팅된 문자열)
  const [amountDisplay, setAmountDisplay] = useState<string>(
    transaction?.amount ? formatNumber(transaction.amount) : ''
  )

  // 금액 입력 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 추출
    const numValue = value ? parseInt(value, 10) : 0
    setValue('amount', numValue)
    setAmountDisplay(numValue > 0 ? formatNumber(numValue) : '')
  }

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        date: formatDateString(transaction.date),
        category1: transaction.category1,
        category2: transaction.category2,
        paymentMethod1: transaction.paymentMethod1 || '',
        paymentMethod2: transaction.paymentMethod2 || '',
        description: transaction.description,
        memo: transaction.memo || '',
      })
      setAmountDisplay(transaction.amount > 0 ? formatNumber(transaction.amount) : '')
    } else {
      reset({
        type: 'expense',
        amount: 0,
        date: formatDateString(new Date()),
        category1: '',
        category2: '',
        paymentMethod1: '',
        paymentMethod2: '',
        description: '',
        memo: '',
      })
      setAmountDisplay('')
    }
  }, [transaction, reset])

  // 카테고리1 변경 시 카테고리2 초기화
  useEffect(() => {
    setValue('category2', '')
  }, [category1, setValue])

  // 결제수단 변경 시 세부 결제수단 초기화
  useEffect(() => {
    setValue('paymentMethod2', '')
  }, [paymentMethod1, setValue])

  const onFormSubmit = (data: TransactionFormData) => {
    onSubmit({
      ledgerId,
      type: data.type,
      amount: data.amount,
      date: new Date(data.date),
      category1: data.category1,
      category2: data.category2,
      paymentMethod1: data.paymentMethod1,
      paymentMethod2: data.paymentMethod2,
      description: data.description,
      memo: data.memo,
    })
    onCancel()
    reset()
  }

  const category1List = type === 'income' ? getIncomeCategory1List() : getExpenseCategory1List()
  const category2List = category1
    ? type === 'income'
      ? getIncomeCategory2List(category1)
      : getExpenseCategory2List(category1)
    : []

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" id="transaction-form">
      {/* 타입 선택 */}
      <div className="space-y-2">
        <Label>타입</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === 'income' ? 'default' : 'outline'}
            onClick={() => setValue('type', 'income')}
            className="flex-1"
          >
            수입
          </Button>
          <Button
            type="button"
            variant={type === 'expense' ? 'default' : 'outline'}
            onClick={() => setValue('type', 'expense')}
            className="flex-1"
          >
            지출
          </Button>
        </div>
      </div>

      {/* 금액 & 날짜 (2단) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">금액 *</Label>
          <Input
            id="amount"
            type="text"
            inputMode="numeric"
            value={amountDisplay}
            onChange={handleAmountChange}
            placeholder="금액을 입력하세요"
            className="text-right"
          />
          <input type="hidden" {...register('amount', { valueAsNumber: true })} />
          {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">날짜 *</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>
      </div>

      {/* 대분류 & 소분류 (2단) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category1">대분류 *</Label>
          <Select id="category1" {...register('category1')}>
            <option value="">선택하세요</option>
            {category1List.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          {errors.category1 && <p className="text-sm text-red-500">{errors.category1.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category2">소분류 *</Label>
          <Select id="category2" {...register('category2')} disabled={!category1}>
            <option value="">선택하세요</option>
            {category2List.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          {errors.category2 && <p className="text-sm text-red-500">{errors.category2.message}</p>}
        </div>
      </div>

      {/* 결제수단 (지출일 때만) */}
      {type === 'expense' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod1">결제수단</Label>
            <Select id="paymentMethod1" {...register('paymentMethod1')}>
              <option value="">선택하세요</option>
              {getPaymentMethod1List().map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod2">세부 결제수단</Label>
            <Select id="paymentMethod2" {...register('paymentMethod2')} disabled={!paymentMethod1}>
              <option value="">선택하세요</option>
              {paymentMethod1 &&
                getPaymentMethod2List(paymentMethod1).map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
            </Select>
          </div>
        </div>
      )}

      {/* 내역 */}
      <div className="space-y-2">
        <Label htmlFor="description">내역 *</Label>
        <Input id="description" {...register('description')} placeholder="거래 내역을 입력하세요" />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      {/* 메모 */}
      <div className="space-y-2">
        <Label htmlFor="memo">메모</Label>
        <Input id="memo" {...register('memo')} placeholder="메모를 입력하세요 (선택사항)" />
      </div>

      {showButtons && (
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            취소
          </Button>
          <Button type="submit" className="flex-1">
            {transaction ? '수정' : '추가'}
          </Button>
        </div>
      )}
    </form>
  )
}
