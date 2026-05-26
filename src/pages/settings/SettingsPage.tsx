import { Adaptive } from '@/shared/ui/adaptive'
import { SettingsPageDesktop } from './SettingsPage.desktop'
import { SettingsPageMobile } from './SettingsPage.mobile'

export function SettingsPage() {
  return (
    <Adaptive
      desktop={<SettingsPageDesktop />}
      mobile={<SettingsPageMobile />}
    />
  )
}
