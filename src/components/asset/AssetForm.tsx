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
import type { Asset } from '@/types'

const assetSchema = z.object({
  name: z.string().min(1, '자산명을 입력해주세요'),
  category1: z.string().min(1, '카테고리를 선택해주세요'),
  category2: z.string().min(1, '카테고리를 선택해주세요'),
  balance: z.number(),
  currency: z.string().min(1, '통화를 선택해주세요'),
  memo: z.string().optional(),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
  asset?: Asset
  onSubmit: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive'>) => void
}

export function AssetForm({ open, onOpenChange, ledgerId, asset, onSubmit }: AssetFormProps) {
  const { getAssetCategory1List, getAssetCategory2List } = useCategories(ledgerId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name || '',
      category1: asset?.category1 || '',
      category2: asset?.category2 || '',
      balance: asset?.balance || 0,
      currency: asset?.currency || 'KRW',
      memo: asset?.memo || '',
    },
  })

  const category1 = watch('category1')

  useEffect(() => {
    if (asset) {
      reset({
        name: asset.name,
        category1: asset.category1,
        category2: asset.category2,
        balance: asset.balance,
        currency: asset.currency,
        memo: asset.memo || '',
      })
    } else {
      reset({
        name: '',
        category1: '',
        category2: '',
        balance: 0,
        currency: 'KRW',
        memo: '',
      })
    }
  }, [asset, reset])

  useEffect(() => {
    setValue('category2', '')
  }, [category1, setValue])

  const onFormSubmit = (data: AssetFormData) => {
    onSubmit({
      ledgerId,
      name: data.name,
      category1: data.category1,
      category2: data.category2,
      balance: data.balance,
      currency: data.currency,
      memo: data.memo,
    })
    onOpenChange(false)
    reset()
  }

  const category1List = getAssetCategory1List()
  const category2List = category1 ? getAssetCategory2List(category1) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{asset ? '자산 수정' : '자산 추가'}</DialogTitle>
        <DialogDescription>
          {asset ? '자산 정보를 수정합니다.' : '새로운 자산을 추가합니다.'}
        </DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* 자산명 */}
          <div className="space-y-2">
            <Label htmlFor="name">자산명 *</Label>
            <Input id="name" {...register('name')} placeholder="예: 신한은행 입출금" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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

          {/* 잔액 */}
          <div className="space-y-2">
            <Label htmlFor="balance">잔액 *</Label>
            <Input
              id="balance"
              type="number"
              {...register('balance', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.balance && <p className="text-sm text-red-500">{errors.balance.message}</p>}
          </div>

          {/* 통화 */}
          <div className="space-y-2">
            <Label htmlFor="currency">통화 *</Label>
            <Select id="currency" {...register('currency')}>
              <option value="KRW">KRW (원)</option>
              <option value="USD">USD (달러)</option>
              <option value="EUR">EUR (유로)</option>
              <option value="JPY">JPY (엔)</option>
            </Select>
            {errors.currency && <p className="text-sm text-red-500">{errors.currency.message}</p>}
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
            <Button type="submit">{asset ? '수정' : '추가'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
