import { Button } from '@/shared/ui/button'
import { MobileFullscreen } from '@/shared/ui/adaptive'
import { LedgerFormContentMobile } from './LedgerFormContentMobile'
import type { Ledger } from '@/shared/types'

interface LedgerFormMobileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledger?: Ledger
  onSubmit: (data: Omit<Ledger, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'members'>) => void
}

export function LedgerFormMobile({
  open,
  onOpenChange,
  ledger,
  onSubmit,
}: LedgerFormMobileProps) {
  const title = ledger ? '가계부 수정' : '가계부 추가'

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
              const form = document.getElementById('ledger-form') as HTMLFormElement
              form?.requestSubmit()
            }}
            className="flex-1"
          >
            {ledger ? '수정' : '추가'}
          </Button>
        </div>
      }
    >
      <LedgerFormContentMobile
        ledger={ledger}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
        showButtons={false}
      />
    </MobileFullscreen>
  )
}
