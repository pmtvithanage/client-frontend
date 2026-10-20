import { Outlet } from 'react-router-dom'

import MobileNav from './MobileNav.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

/**
 * Shell for every signed-in page: sticky top bar, desktop sidebar, scrolling
 * main region and the phone bottom tab bar. The main region keeps bottom space
 * clear of the fixed tab bar.
 */
export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 pb-28 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
