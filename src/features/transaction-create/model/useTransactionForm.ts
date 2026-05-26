import { useEffect, useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCategories } from '@/shared/hooks/useCategories'
import { useCategoryStore } from '@/entities/category/model/store'
import type { Transaction } from '@/shared/types'
import { formatDateString, formatNumber } from '@/shared/lib/utils'

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

export type TransactionFormData = z.infer<typeof transactionSchema>

interface UseTransactionFormOptions {
  ledgerId: string
  transaction?: Transaction
  defaultTransaction?: Transaction
  defaultDate?: Date | null
  onSubmit: (
    data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>
  ) => void
  onCancel: () => void
}

function getDefaultValues(
  tx?: Transaction,
  defaultTx?: Transaction,
  defaultDt?: Date | null
): TransactionFormData {
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

export function useTransactionForm({
  ledgerId,
  transaction,
  defaultTransaction,
  defaultDate,
  onSubmit,
  onCancel,
}: UseTransactionFormOptions) {
  const {
    getIncomeCategory1List,
    getIncomeCategory2List,
    getExpenseCategory1List,
    getExpenseCategory2List,
    getPaymentMethod1List,
    getPaymentMethod2List,
  } = useCategories(ledgerId)

  const ledgerCategories = useCategoryStore((state) => state.categories[ledgerId])
  const categoriesLoaded = !!ledgerCategories

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getDefaultValues(
      transaction,
      defaultTransaction,
      defaultDate
    ),
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = form

  const type = watch('type')
  const category1 = watch('category1')
  const paymentMethod1 = watch('paymentMethod1')

  const prevCategory1Ref = useRef<string | undefined>(
    transaction?.category1 || defaultTransaction?.category1
  )
  const prevPaymentMethod1Ref = useRef<string | undefined>(
    transaction?.paymentMethod1 || defaultTransaction?.paymentMethod1
  )
  const isInitializedRef = useRef(false)
  const prevTransactionIdRef = useRef<string | undefined>(undefined)
  const categoryValuesSetRef = useRef<string | undefined>(undefined)

  const [amountDisplay, setAmountDisplay] = useState<string>(
    transaction?.amount || defaultTransaction?.amount
      ? formatNumber(transaction?.amount || defaultTransaction?.amount || 0)
      : ''
  )

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    const numValue = value ? parseInt(value, 10) : 0
    setValue('amount', numValue)
    setAmountDisplay(numValue > 0 ? formatNumber(numValue) : '')
  }

  useEffect(() => {
    const currentTransactionId = transaction?.id

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
        setAmountDisplay(
          transaction.amount > 0 ? formatNumber(transaction.amount) : ''
        )
        prevCategory1Ref.current = transaction.category1
        prevPaymentMethod1Ref.current = transaction.paymentMethod1 || ''
      } else if (defaultTransaction) {
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
        setAmountDisplay(
          defaultTransaction.amount > 0
            ? formatNumber(defaultTransaction.amount)
            : ''
        )
        prevCategory1Ref.current = defaultTransaction.category1
        prevPaymentMethod1Ref.current =
          defaultTransaction.paymentMethod1 || ''
      } else {
        const defaultValues: TransactionFormData = {
          type: 'expense',
          amount: 0,
          date: defaultDate
            ? formatDateString(defaultDate)
            : formatDateString(new Date()),
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
      categoryValuesSetRef.current = undefined
    }
  }, [transaction?.id, defaultTransaction, defaultDate, reset])

  useEffect(() => {
    if (
      categoriesLoaded &&
      transaction &&
      prevTransactionIdRef.current === transaction.id &&
      categoryValuesSetRef.current !== transaction.id
    ) {
      const timer = setTimeout(() => {
        setValue('category1', transaction.category1, {
          shouldValidate: false,
          shouldDirty: false,
        })
        setValue('category2', transaction.category2, {
          shouldValidate: false,
          shouldDirty: false,
        })
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

  const category1List =
    type === 'income' ? getIncomeCategory1List() : getExpenseCategory1List()
  const category2List = category1
    ? type === 'income'
      ? getIncomeCategory2List(category1)
      : getExpenseCategory2List(category1)
    : []

  return {
    register,
    handleSubmit,
    errors,
    control,
    type,
    category1,
    paymentMethod1,
    setValue,
    amountDisplay,
    handleAmountChange,
    onFormSubmit,
    category1List,
    category2List,
    getPaymentMethod1List,
    getPaymentMethod2List,
    transaction,
  }
}
