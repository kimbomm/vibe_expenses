import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui/button'

interface MobileFullscreenProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function MobileFullscreen({
  open,
  title,
  onClose,
  children,
  footer,
}: MobileFullscreenProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-4 border-b p-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-24">{children}</div>
      {footer ? (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
