import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { useCategories } from '@/shared/hooks/useCategories'
import { formatNumber } from '@/shared/lib/utils'
import type { Asset } from '@/shared/types'

const assetSchema = z.object({
  name: z.string().min(1, '자산명을 입력해주세요'),
  category1: z.string().min(1, '카테고리를 선택해주세요'),
  category2: z.string().min(1, '카테고리를 선택해주세요'),
  balance: z.number(),
  memo: z.string().optional(),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormContentProps {
  ledgerId: string
  asset?: Asset
  onSubmit: (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => void
  onCancel: () => void
  showButtons?: boolean
}

export function AssetFormContent({
  ledgerId,
  asset,
  onSubmit,
  onCancel,
  showButtons = true,
}: AssetFormContentProps) {
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
      memo: asset?.memo || '',
    },
  })

  const category1 = watch('category1')
  const [balanceDisplay, setBalanceDisplay] = useState<string>(
    asset?.balance ? formatNumber(Math.abs(asset.balance)) : ''
  )

  // 잔액 입력 핸들러 (실시간 포맷팅)
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 추출 (카테고리로 부채를 구분하므로 항상 양수)
    const rawValue = e.target.value.replace(/[^0-9]/g, '')

    if (rawValue === '') {
      setValue('balance', 0)
      setBalanceDisplay('')
      return
    }

    // 숫자 문자열을 숫자로 변환 (항상 양수)
    const numValue = parseInt(rawValue, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      setValue('balance', numValue)
      setBalanceDisplay(formatNumber(numValue))
    }
  }

  useEffect(() => {
    if (asset) {
      reset({
        name: asset.name,
        category1: asset.category1,
        category2: asset.category2,
        balance: Math.abs(asset.balance), // 항상 양수로 저장
        memo: asset.memo || '',
      })
      setBalanceDisplay(formatNumber(Math.abs(asset.balance)))
    } else {
      reset({
        name: '',
        category1: '',
        category2: '',
        balance: 0,
        memo: '',
      })
      setBalanceDisplay('')
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
      currency: 'KRW',
      memo: data.memo,
    })
    onCancel()
    reset()
  }

  const category1List = getAssetCategory1List()
  const category2List = category1 ? getAssetCategory2List(category1) : []

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" id="asset-form">
      {/* 자산명 */}
      <div className="space-y-2">
        <Label htmlFor="name">자산명 *</Label>
        <Input id="name" {...register('name')} placeholder="예: 신한은행 입출금" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
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

      {/* 잔액 */}
      <div className="space-y-2">
        <Label htmlFor="balance">잔액 (KRW) *</Label>
        <Input
          id="balance"
          type="text"
          inputMode="numeric"
          value={balanceDisplay}
          onChange={handleBalanceChange}
          placeholder="금액을 입력하세요"
          className="text-right"
        />
        <input type="hidden" {...register('balance', { valueAsNumber: true })} />
        {errors.balance && <p className="text-sm text-red-500">{errors.balance.message}</p>}
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
            {asset ? '수정' : '추가'}
          </Button>
        </div>
      )}
    </form>
  )
}
