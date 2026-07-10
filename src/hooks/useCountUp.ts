import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1400, decimals = 0) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let start: number | null = null
    let frame: number

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
}
