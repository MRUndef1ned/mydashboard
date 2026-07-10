import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 14,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: 'blur(4px)',
  },
}

export const pageTransition = {
  duration: 0.42,
  ease,
}

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

export const authVariants = {
  initial: { opacity: 0, scale: 0.97, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -12 },
}

export const authTransition = {
  duration: 0.5,
  ease,
}
