import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { PageTransition } from '../components/PageTransition'
import { CommandPalette } from '../components/CommandPalette'

export function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="mesh-bg min-h-screen">
      <Sidebar />
      <main className="min-h-screen lg:ml-64">
        <Header />
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
      <CommandPalette />
    </div>
  )
}
