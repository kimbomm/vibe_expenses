import { Adaptive } from '@/shared/ui/adaptive'
import { InvitationsPageDesktop } from './InvitationsPage.desktop'
import { InvitationsPageMobile } from './InvitationsPage.mobile'

export function InvitationsPage() {
  return (
    <Adaptive
      desktop={<InvitationsPageDesktop />}
      mobile={<InvitationsPageMobile />}
    />
  )
}
