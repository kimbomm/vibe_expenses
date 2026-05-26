import { Outlet } from 'react-router-dom'
import { HeaderDesktop } from '@/widgets/layout/header/ui/HeaderDesktop'
import { SidebarDesktop } from '@/widgets/layout/sidebar/ui/SidebarDesktop'

export function LayoutDesktop() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderDesktop />
      <SidebarDesktop />
      <main className="pl-64">
        <div className="container mx-auto max-w-7xl px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
