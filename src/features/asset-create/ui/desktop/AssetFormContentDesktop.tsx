import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { useAssetForm } from '../../model/useAssetForm'
import type { Asset } from '@/shared/types'

interface AssetFormContentDesktopProps {
  ledgerId: string
  asset?: Asset
  onSubmit: (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => void
  onCancel: () => void
  showButtons?: boolean
}

export function AssetFormContentDesktop({
  ledgerId,
  asset,
  onSubmit,
  onCancel,
  showButtons = true,
}: AssetFormContentDesktopProps) {
  const {
    register,
    handleSubmit,
    errors,
    category1,
    category1List,
    category2List,
    balanceDisplay,
    handleBalanceChange,
    onFormSubmit,
    asset: editingAsset,
  } = useAssetForm({ ledgerId, asset, onSubmit, onCancel })

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4" id="asset-form">
      <div className="space-y-2">
        <Label htmlFor="name">자산명 *</Label>
        <Input id="name" {...register('name')} placeholder="예: 신한은행 입출금" />
        {errors.name ? <p className="text-sm text-red-500">{errors.name.message}</p> : null}
      </div>

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
          {errors.category1 ? (
            <p className="text-sm text-red-500">{errors.category1.message}</p>
          ) : null}
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
          {errors.category2 ? (
            <p className="text-sm text-red-500">{errors.category2.message}</p>
          ) : null}
        </div>
      </div>

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
        {errors.balance ? (
          <p className="text-sm text-red-500">{errors.balance.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">메모</Label>
        <Input id="memo" {...register('memo')} placeholder="메모를 입력하세요 (선택사항)" />
      </div>

      {showButtons ? (
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            취소
          </Button>
          <Button type="submit" className="flex-1">
            {editingAsset ? '수정' : '추가'}
          </Button>
        </div>
      ) : null}
    </form>
  )
}
