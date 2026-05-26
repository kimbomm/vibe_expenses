import { Adaptive } from '@/shared/ui/adaptive'
import { HeaderDesktop } from './HeaderDesktop'
import { HeaderMobile } from './HeaderMobile'

interface HeaderProps {
  onMenuClick?: () => void
}

/** @deprecated Layout에서 Adaptive로 분기합니다. */
export function Header({ onMenuClick }: HeaderProps) {
  return (
    <Adaptive
      desktop={<HeaderDesktop />}
      mobile={<HeaderMobile onMenuClick={onMenuClick} />}
    />
  )
}
