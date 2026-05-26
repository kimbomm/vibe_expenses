import { Button } from '@/shared/ui/button'
import { MobileFullscreen } from '@/shared/ui/adaptive'
import { AssetFormContentMobile } from './AssetFormContentMobile'
import type { Asset } from '@/shared/types'

interface AssetFormMobileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
  asset?: Asset
  onSubmit: (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => void
}

export function AssetFormMobile({
  open,
  onOpenChange,
  ledgerId,
  asset,
  onSubmit,
}: AssetFormMobileProps) {
  const title = asset ? '자산 수정' : '자산 추가'

  return (
    <MobileFullscreen
      open={open}
      title={title}
      onClose={() => onOpenChange(false)}
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={() => {
              const form = document.getElementById('asset-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            className="flex-1"
          >
            {asset ? '수정' : '추가'}
          </Button>
        </div>
      }
    >
      <AssetFormContentMobile
        ledgerId={ledgerId}
        asset={asset}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
        showButtons={false}
      />
    </MobileFullscreen>
  )
}
