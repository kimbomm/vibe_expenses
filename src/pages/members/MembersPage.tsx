import { Adaptive } from '@/shared/ui/adaptive'
import { MembersPageDesktop } from './MembersPage.desktop'
import { MembersPageMobile } from './MembersPage.mobile'

export function MembersPage() {
  return (
    <Adaptive
      desktop={<MembersPageDesktop />}
      mobile={<MembersPageMobile />}
    />
  )
}
