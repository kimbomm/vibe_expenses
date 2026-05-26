import { Controller } from 'react-hook-form'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { useTransactionForm } from '../../model/useTransactionForm'
import type { Transaction } from '@/shared/types'

interface TransactionFormContentMobileProps {
  ledgerId: string
  transaction?: Transaction
  defaultTransaction?: Transaction
  defaultDate?: Date | null
  onSubmit: (
    data: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>
  ) => void
  onCancel: () => void
  showButtons?: boolean
}

export function TransactionFormContentMobile({
  ledgerId,
  transaction,
  defaultTransaction,
  defaultDate,
  onSubmit,
  onCancel,
  showButtons = true,
}: TransactionFormContentMobileProps) {
  const {
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
    transaction: editingTransaction,
  } = useTransactionForm({
    ledgerId,
    transaction,
    defaultTransaction,
    defaultDate,
    onSubmit,
    onCancel,
  })

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4"
      id="transaction-form"
    >
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
        {errors.amount ? (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">날짜 *</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date ? (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        ) : null}
      </div>

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
        {errors.category1 ? (
          <p className="text-sm text-red-500">{errors.category1.message}</p>
        ) : null}
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
        {errors.category2 ? (
          <p className="text-sm text-red-500">{errors.category2.message}</p>
        ) : null}
      </div>

      {type === 'expense' ? (
        <>
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
                  {paymentMethod1
                    ? getPaymentMethod2List(paymentMethod1).map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))
                    : null}
                </Select>
              )}
            />
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="description">내역 *</Label>
        <Input
          id="description"
          {...register('description')}
          placeholder="거래 내역을 입력하세요"
        />
        {errors.description ? (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">메모</Label>
        <Input
          id="memo"
          {...register('memo')}
          placeholder="메모를 입력하세요 (선택사항)"
        />
      </div>

      {showButtons ? (
        <div className="flex flex-col gap-2 pt-4">
          <Button type="submit" className="w-full">
            {editingTransaction ? '수정' : '추가'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full"
          >
            취소
          </Button>
        </div>
      ) : null}
    </form>
  )
}
