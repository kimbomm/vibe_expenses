import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/shared/ui/dialog'
import { ImportTransactionContent } from './ImportTransactionContent'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'

interface ImportTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledgerId: string
}

export function ImportTransactionModal({
  open,
  onOpenChange,
  ledgerId,
}: ImportTransactionModalProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  // 모바일일 때는 페이지로 이동
  useEffect(() => {
    if (open && isMobile) {
      navigate(`/ledgers/${ledgerId}/transactions/import`, {
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
        <DialogTitle>거래내역 일괄 업로드</DialogTitle>
        <DialogDescription>Excel 파일을 업로드하여 거래내역을 일괄 추가합니다.</DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <ImportTransactionContent ledgerId={ledgerId} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
