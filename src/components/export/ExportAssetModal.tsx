import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { ExportAssetContent } from './ExportAssetContent'
import { useIsMobile } from '@/hooks/useMediaQuery'

interface ExportAssetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ExportAssetModal({ open, onOpenChange, ledgerId }: ExportAssetModalProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  // 모바일일 때는 페이지로 이동
  useEffect(() => {
    if (open && isMobile) {
      navigate(`/ledgers/${ledgerId}/assets/export`, {
        state: { returnPath: location.pathname },
      })
      onOpenChange(false)
    }
  }, [open, isMobile, ledgerId, navigate, location.pathname, onOpenChange])

  // 모바일이면 모달을 렌더링하지 않음
  if (isMobile || !open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>자산 현황 내보내기</DialogTitle>
        <DialogDescription>자산 현황을 Excel 파일로 내보냅니다.</DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <ExportAssetContent ledgerId={ledgerId} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
