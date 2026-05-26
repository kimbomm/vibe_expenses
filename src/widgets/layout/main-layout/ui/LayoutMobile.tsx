import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { HeaderMobile } from '@/widgets/layout/header/ui/HeaderMobile'
import { SidebarMobile } from '@/widgets/layout/sidebar/ui/SidebarMobile'

export function LayoutMobile() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <HeaderMobile onMenuClick={() => setSidebarOpen(true)} />
      <SidebarMobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main>
        <div className="px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
