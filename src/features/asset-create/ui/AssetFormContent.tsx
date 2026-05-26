import { Adaptive } from '@/shared/ui/adaptive'
import { AssetFormContentDesktop } from './desktop/AssetFormContentDesktop'
import { AssetFormContentMobile } from './mobile/AssetFormContentMobile'
import type { Asset } from '@/shared/types'

interface AssetFormContentProps {
  ledgerId: string
  asset?: Asset
  onSubmit: (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => void
  onCancel: () => void
  showButtons?: boolean
}

export function AssetFormContent(props: AssetFormContentProps) {
  return (
    <Adaptive
      desktop={<AssetFormContentDesktop {...props} />}
      mobile={<AssetFormContentMobile {...props} />}
    />
  )
}
