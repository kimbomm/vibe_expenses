import { Adaptive } from '@/shared/ui/adaptive'
import { AssetFormDesktop } from './desktop/AssetFormDesktop'
import { AssetFormMobile } from './mobile/AssetFormMobile'
import type { Asset } from '@/shared/types'

interface AssetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
  asset?: Asset
  onSubmit: (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => void
}

export function AssetForm(props: AssetFormProps) {
  return (
    <Adaptive
      desktop={<AssetFormDesktop {...props} />}
      mobile={<AssetFormMobile {...props} />}
    />
  )
}
