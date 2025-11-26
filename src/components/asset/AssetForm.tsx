import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { AssetFormContent } from './AssetFormContent'
import { useIsMobile } from '@/hooks/useMediaQuery'
import type { Asset } from '@/types'

interface AssetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
  asset?: Asset
  onSubmit: (
    data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive' | 'currency'>
  ) => void
}

export function AssetForm({ open, onOpenChange, ledgerId, asset, onSubmit }: AssetFormProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  // 모바일일 때는 페이지로 이동
  useEffect(() => {
    if (open && isMobile) {
      const path = asset
        ? `/ledgers/${ledgerId}/assets/${asset.id}/edit`
        : `/ledgers/${ledgerId}/assets/new`
      navigate(path, {
        state: { returnPath: location.pathname },
      })
      onOpenChange(false)
    }
  }, [open, isMobile, ledgerId, asset, navigate, location.pathname, onOpenChange])

  // 모바일이면 모달을 렌더링하지 않음
  if (isMobile || !open) {
    return null
  }

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
        <AssetFormContent
          ledgerId={ledgerId}
          asset={asset}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
