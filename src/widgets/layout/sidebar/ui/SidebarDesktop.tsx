import { useEffect } from 'react'
import { useAuthStore } from '@/entities/user/model/store'
import { useLedgerStore } from '@/entities/ledger/model/store'
import { SidebarNav, useSidebarLedger } from './SidebarNav'

export function SidebarDesktop() {
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
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <SidebarNav
          ledgerId={currentLedger?.id}
          ledgerName={currentLedger?.name}
        />
      </div>
    </aside>
  )
}
