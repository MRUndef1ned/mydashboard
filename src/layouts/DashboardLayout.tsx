import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { PageTransition } from '../components/PageTransition'

export function DashboardLayout() {
  const location = useLocation()

  return (
    <div className="mesh-bg min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <Header />
        <div className="p-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
