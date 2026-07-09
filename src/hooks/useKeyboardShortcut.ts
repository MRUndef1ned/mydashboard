import { useEffect } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { meta?: boolean },
) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== key.toLowerCase()) return
      if (options?.meta && !(e.metaKey || e.ctrlKey)) return
      e.preventDefault()
      callback()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, callback, options?.meta])
}
