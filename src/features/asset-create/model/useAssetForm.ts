import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

export type AssetFormData = z.infer<typeof assetSchema>

interface UseAssetFormOptions {
  ledgerId: string
  asset?: Asset
  onSubmit: (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => void
  onCancel: () => void
}

export function useAssetForm({ ledgerId, asset, onSubmit, onCancel }: UseAssetFormOptions) {
  const { getAssetCategory1List, getAssetCategory2List } = useCategories(ledgerId)

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name || '',
      category1: asset?.category1 || '',
      category2: asset?.category2 || '',
      balance: asset?.balance || 0,
      memo: asset?.memo || '',
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form

  const category1 = watch('category1')
  const [balanceDisplay, setBalanceDisplay] = useState<string>(
    asset?.balance ? formatNumber(Math.abs(asset.balance)) : ''
  )

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')

    if (rawValue === '') {
      setValue('balance', 0)
      setBalanceDisplay('')
      return
    }

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
        balance: Math.abs(asset.balance),
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

  return {
    register,
    handleSubmit,
    errors,
    category1,
    category1List,
    category2List,
    balanceDisplay,
    handleBalanceChange,
    onFormSubmit,
    asset,
  }
}
