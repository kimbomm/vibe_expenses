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
import { LedgerFormContent } from './LedgerFormContent'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'
import type { Ledger } from '@/shared/types'

interface LedgerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledger?: Ledger
  onSubmit: (data: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>) => void
}

export function LedgerForm({ open, onOpenChange, ledger, onSubmit }: LedgerFormProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()

  // 모바일일 때는 페이지로 이동
  useEffect(() => {
    if (open && isMobile) {
      const path = ledger ? `/ledgers/${ledger.id}/edit` : '/ledgers/new'
      navigate(path, {
        state: { returnPath: location.pathname },
      })
      onOpenChange(false)
    }
  }, [open, isMobile, ledger, navigate, location.pathname, onOpenChange])

  // 모바일이면 모달을 렌더링하지 않음
  if (isMobile || !open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{ledger ? '가계부 수정' : '가계부 추가'}</DialogTitle>
        <DialogDescription>
          {ledger ? '가계부 정보를 수정합니다.' : '새로운 가계부를 생성합니다.'}
        </DialogDescription>
        <DialogClose onClose={() => onOpenChange(false)} />
      </DialogHeader>
      <DialogContent>
        <LedgerFormContent
          ledger={ledger}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
