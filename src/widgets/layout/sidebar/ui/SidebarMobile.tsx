import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { useAuthStore } from '@/entities/user/model/store'
import { useLedgerStore } from '@/entities/ledger/model/store'
import { SidebarNav, useSidebarLedger } from './SidebarNav'

interface SidebarMobileProps {
  open: boolean
  onClose: () => void
}

export function SidebarMobile({ open, onClose }: SidebarMobileProps) {
  const { user } = useAuthStore()
  const { ledgers, fetchLedgers } = useLedgerStore()
  const { effectiveLedgerId } = useSidebarLedger()

  useEffect(() => {
    if (!user?.uid) return
    fetchLedgers(user.uid)
  }, [user?.uid, fetchLedgers])

  useEffect(() => {
    if (effectiveLedgerId) {
      localStorage.setItem('lastLedgerId', effectiveLedgerId)
    }
  }, [effectiveLedgerId])

  const currentLedger = effectiveLedgerId
    ? ledgers.find((l) => l.id === effectiveLedgerId)
    : null

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      ) : null}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between px-4">
            <span className="text-lg font-semibold">메뉴</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarNav
            ledgerId={currentLedger?.id}
            ledgerName={currentLedger?.name}
            onNavigate={onClose}
          />
        </div>
      </aside>
    </>
  )
}
