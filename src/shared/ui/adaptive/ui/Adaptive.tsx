import type { ReactNode } from 'react'
import { useIsMobile } from '@/shared/hooks/useMediaQuery'

interface AdaptiveProps {
  desktop: ReactNode
  mobile: ReactNode
}

export function Adaptive({ desktop, mobile }: AdaptiveProps) {
  const isMobile = useIsMobile()
  return <>{isMobile ? mobile : desktop}</>
}
