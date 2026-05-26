import { Adaptive } from '@/shared/ui/adaptive'
import { LoginPageDesktop } from './LoginPage.desktop'
import { LoginPageMobile } from './LoginPage.mobile'

export function LoginPage() {
  return (
    <Adaptive
      desktop={<LoginPageDesktop />}
      mobile={<LoginPageMobile />}
    />
  )
}
