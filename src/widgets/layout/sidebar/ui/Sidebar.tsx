import { Adaptive } from '@/shared/ui/adaptive'
import { SidebarDesktop } from './SidebarDesktop'
import { SidebarMobile } from './SidebarMobile'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

/** @deprecated Layout에서 Adaptive로 분기합니다. */
export function Sidebar({ open = false, onClose }: SidebarProps) {
  return (
    <Adaptive
      desktop={<SidebarDesktop />}
      mobile={<SidebarMobile open={open} onClose={onClose ?? (() => {})} />}
    />
  )
}
