import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'

import LoadingSkeleton from '../common/LoadingSkeleton.jsx'
import { readSession } from '../../utils/session.js'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

/**
 * Shell for every signed-in page: sidebar on the left, sticky topbar, content
 * area. The sidebar collapses into an overlay below `lg`.
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const session = readSession()
  const role = session?.user?.role || 'member'

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          clientName={session?.user?.name || 'Client'}
          role={role}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <Suspense fallback={<LoadingSkeleton className="mt-4" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
