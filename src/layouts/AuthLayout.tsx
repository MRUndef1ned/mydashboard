import { AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { authTransition, authVariants } from '../components/PageTransition'

export function AuthLayout() {
  const location = useLocation()

  return (
    <div className="mesh-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-xl shadow-indigo-500/30">
            <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Nexus</h1>
          <p className="text-sm text-zinc-500">Dashboard'a hoş geldiniz</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={authVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={authTransition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
