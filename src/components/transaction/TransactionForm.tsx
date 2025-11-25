import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import type { Transaction } from '@/types'
import { formatDateString } from '@/lib/utils'

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

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
  transaction?: Transaction
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>) => void
}

export function TransactionForm({
  open,
  onOpenChange,
  ledgerId,
  transaction,
  onSubmit,
}: TransactionFormProps) {
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
    }
  }, [transaction, reset])

  // 카테고리1 변경 시 카테고리2 초기화
  useEffect(() => {
    setValue('category2', '')
  }, [category1, setValue])

  // 지출방법1 변경 시 지출방법2 초기화
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
    onOpenChange(false)
    reset()
  }

  const category1List = type === 'income' ? getIncomeCategory1List() : getExpenseCategory1List()
  const category2List = category1
    ? type === 'income'
      ? getIncomeCategory2List(category1)
      : getExpenseCategory2List(category1)
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{transaction ? '거래 수정' : '거래 추가'}</DialogTitle>
        <DialogDescription>
          {transaction ? '거래 내역을 수정합니다.' : '새로운 거래 내역을 추가합니다.'}
        </DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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

          {/* 금액 */}
          <div className="space-y-2">
            <Label htmlFor="amount">금액 *</Label>
            <Input
              id="amount"
              type="number"
              {...register('amount', { valueAsNumber: true })}
              placeholder="금액을 입력하세요"
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          {/* 날짜 */}
          <div className="space-y-2">
            <Label htmlFor="date">날짜 *</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          </div>

          {/* 카테고리 1 */}
          <div className="space-y-2">
            <Label htmlFor="category1">카테고리 1 *</Label>
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

          {/* 카테고리 2 */}
          {category1 && (
            <div className="space-y-2">
              <Label htmlFor="category2">카테고리 2 *</Label>
              <Select id="category2" {...register('category2')} disabled={!category1}>
                <option value="">선택하세요</option>
                {category2List.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
              {errors.category2 && (
                <p className="text-sm text-red-500">{errors.category2.message}</p>
              )}
            </div>
          )}

          {/* 지출방법 (지출일 때만) */}
          {type === 'expense' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod1">지출방법 1</Label>
                <Select id="paymentMethod1" {...register('paymentMethod1')}>
                  <option value="">선택하세요</option>
                  {getPaymentMethod1List().map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </Select>
              </div>

              {paymentMethod1 && (
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod2">지출방법 2</Label>
                  <Select
                    id="paymentMethod2"
                    {...register('paymentMethod2')}
                    disabled={!paymentMethod1}
                  >
                    <option value="">선택하세요</option>
                    {getPaymentMethod2List(paymentMethod1).map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </>
          )}

          {/* 내역 */}
          <div className="space-y-2">
            <Label htmlFor="description">내역 *</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="거래 내역을 입력하세요"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모</Label>
            <Input id="memo" {...register('memo')} placeholder="메모를 입력하세요 (선택사항)" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{transaction ? '수정' : '추가'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
