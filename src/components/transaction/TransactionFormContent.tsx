import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import { useCategoryStore } from '@/stores/categoryStore'
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
  defaultTransaction?: Transaction
  defaultDate?: Date | null
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>) => void
  onCancel: () => void
  showButtons?: boolean
}

export function TransactionFormContent({
  ledgerId,
  transaction,
  defaultTransaction,
  defaultDate,
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

  // 카테고리 로드 상태 확인
  const ledgerCategories = useCategoryStore((state) => state.categories[ledgerId])
  const categoriesLoaded = !!ledgerCategories

  // transaction이 있을 때 기본값 설정
  const getDefaultValues = (tx?: Transaction, defaultTx?: Transaction, defaultDt?: Date | null): TransactionFormData => {
    if (tx) {
      return {
        type: tx.type,
        amount: tx.amount,
        date: formatDateString(tx.date),
        category1: tx.category1,
        category2: tx.category2,
        paymentMethod1: tx.paymentMethod1 || '',
        paymentMethod2: tx.paymentMethod2 || '',
        description: tx.description,
        memo: tx.memo || '',
      }
    }
    if (defaultTx) {
      return {
        type: defaultTx.type,
        amount: defaultTx.amount,
        date: formatDateString(defaultTx.date),
        category1: defaultTx.category1,
        category2: defaultTx.category2,
        paymentMethod1: defaultTx.paymentMethod1 || '',
        paymentMethod2: defaultTx.paymentMethod2 || '',
        description: defaultTx.description,
        memo: defaultTx.memo || '',
      }
    }
    return {
      type: 'expense',
      amount: 0,
      date: defaultDt ? formatDateString(defaultDt) : formatDateString(new Date()),
      category1: '',
      category2: '',
      paymentMethod1: '',
      paymentMethod2: '',
      description: '',
      memo: '',
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getDefaultValues(transaction, defaultTransaction, defaultDate),
  })

  const type = watch('type')
  const category1 = watch('category1')
  const paymentMethod1 = watch('paymentMethod1')

  // 이전 값 추적 (초기 로드 시 초기화 방지)
  const prevCategory1Ref = useRef<string | undefined>(
    transaction?.category1 || defaultTransaction?.category1
  )
  const prevPaymentMethod1Ref = useRef<string | undefined>(
    transaction?.paymentMethod1 || defaultTransaction?.paymentMethod1
  )
  const isInitializedRef = useRef(false)
  const prevTransactionIdRef = useRef<string | undefined>(undefined)
  const categoryValuesSetRef = useRef<string | undefined>(undefined)

  // 금액 표시용 상태 (포맷팅된 문자열)
  const [amountDisplay, setAmountDisplay] = useState<string>(
    transaction?.amount || defaultTransaction?.amount
      ? formatNumber(transaction?.amount || defaultTransaction?.amount || 0)
      : ''
  )

  // 금액 입력 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '') // 숫자만 추출
    const numValue = value ? parseInt(value, 10) : 0
    setValue('amount', numValue)
    setAmountDisplay(numValue > 0 ? formatNumber(numValue) : '')
  }

  // transaction이 변경될 때 폼 리셋
  useEffect(() => {
    const currentTransactionId = transaction?.id

    // transaction.id가 변경된 경우에만 리셋
    // transaction이 undefined에서 값으로 변경되거나, 다른 transaction으로 변경될 때
    if (prevTransactionIdRef.current !== currentTransactionId) {
      if (transaction) {
        const defaultValues: TransactionFormData = {
          type: transaction.type,
          amount: transaction.amount,
          date: formatDateString(transaction.date),
          category1: transaction.category1,
          category2: transaction.category2,
          paymentMethod1: transaction.paymentMethod1 || '',
          paymentMethod2: transaction.paymentMethod2 || '',
          description: transaction.description,
          memo: transaction.memo || '',
        }
        reset(defaultValues)
        setAmountDisplay(transaction.amount > 0 ? formatNumber(transaction.amount) : '')
        prevCategory1Ref.current = transaction.category1
        prevPaymentMethod1Ref.current = transaction.paymentMethod1 || ''
      } else if (defaultTransaction) {
        // 복사 모드 (추가 모드)
        const defaultValues: TransactionFormData = {
          type: defaultTransaction.type,
          amount: defaultTransaction.amount,
          date: formatDateString(defaultTransaction.date),
          category1: defaultTransaction.category1,
          category2: defaultTransaction.category2,
          paymentMethod1: defaultTransaction.paymentMethod1 || '',
          paymentMethod2: defaultTransaction.paymentMethod2 || '',
          description: defaultTransaction.description,
          memo: defaultTransaction.memo || '',
        }
        reset(defaultValues)
        setAmountDisplay(defaultTransaction.amount > 0 ? formatNumber(defaultTransaction.amount) : '')
        prevCategory1Ref.current = defaultTransaction.category1
        prevPaymentMethod1Ref.current = defaultTransaction.paymentMethod1 || ''
      } else {
        const defaultValues: TransactionFormData = {
          type: 'expense',
          amount: 0,
          date: defaultDate ? formatDateString(defaultDate) : formatDateString(new Date()),
          category1: '',
          category2: '',
          paymentMethod1: '',
          paymentMethod2: '',
          description: '',
          memo: '',
        }
        reset(defaultValues)
        setAmountDisplay('')
        prevCategory1Ref.current = undefined
        prevPaymentMethod1Ref.current = undefined
      }

      isInitializedRef.current = true
      prevTransactionIdRef.current = currentTransactionId
      // transaction이 변경되면 categoryValuesSetRef도 초기화
      categoryValuesSetRef.current = undefined
    }
  }, [transaction?.id, defaultTransaction, defaultDate, reset])

  // 카테고리가 로드된 후 셀렉트 박스 값 설정 (한 번만 실행)
  useEffect(() => {
    if (
      categoriesLoaded &&
      transaction &&
      prevTransactionIdRef.current === transaction.id &&
      categoryValuesSetRef.current !== transaction.id
    ) {
      // 카테고리 리스트가 로드된 후에만 셀렉트 박스 값 설정
      // 한 번만 실행되도록 transaction.id를 추적
      const timer = setTimeout(() => {
        setValue('category1', transaction.category1, { shouldValidate: false, shouldDirty: false })
        setValue('category2', transaction.category2, { shouldValidate: false, shouldDirty: false })
        if (transaction.paymentMethod1) {
          setValue('paymentMethod1', transaction.paymentMethod1, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        if (transaction.paymentMethod2) {
          setValue('paymentMethod2', transaction.paymentMethod2, {
            shouldValidate: false,
            shouldDirty: false,
          })
        }
        categoryValuesSetRef.current = transaction.id
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [categoriesLoaded, transaction, setValue])

  // 카테고리1 변경 시 카테고리2 초기화 (초기 로드가 아닐 때만)
  useEffect(() => {
    if (
      isInitializedRef.current &&
      prevCategory1Ref.current !== undefined &&
      category1 !== prevCategory1Ref.current
    ) {
      setValue('category2', '')
    }
    prevCategory1Ref.current = category1
  }, [category1, setValue])

  // 결제수단 변경 시 세부 결제수단 초기화 (초기 로드가 아닐 때만)
  useEffect(() => {
    if (
      isInitializedRef.current &&
      prevPaymentMethod1Ref.current !== undefined &&
      paymentMethod1 !== prevPaymentMethod1Ref.current
    ) {
      setValue('paymentMethod2', '')
    }
    prevPaymentMethod1Ref.current = paymentMethod1
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
          <Controller
            name="category1"
            control={control}
            render={({ field }) => (
              <Select
                id="category1"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              >
                <option value="">선택하세요</option>
                {category1List.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            )}
          />
          {errors.category1 && <p className="text-sm text-red-500">{errors.category1.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category2">소분류 *</Label>
          <Controller
            name="category2"
            control={control}
            render={({ field }) => (
              <Select
                id="category2"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                disabled={!category1}
              >
                <option value="">선택하세요</option>
                {category2List.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            )}
          />
          {errors.category2 && <p className="text-sm text-red-500">{errors.category2.message}</p>}
        </div>
      </div>

      {/* 결제수단 (지출일 때만) */}
      {type === 'expense' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod1">결제수단</Label>
            <Controller
              name="paymentMethod1"
              control={control}
              render={({ field }) => (
                <Select
                  id="paymentMethod1"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                >
                  <option value="">선택하세요</option>
                  {getPaymentMethod1List().map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod2">세부 결제수단</Label>
            <Controller
              name="paymentMethod2"
              control={control}
              render={({ field }) => (
                <Select
                  id="paymentMethod2"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  disabled={!paymentMethod1}
                >
                  <option value="">선택하세요</option>
                  {paymentMethod1 &&
                    getPaymentMethod2List(paymentMethod1).map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                </Select>
              )}
            />
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
