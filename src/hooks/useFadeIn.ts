import { useEffect, useRef } from 'react'

export function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('is-visible')
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible')
            observer.unobserve(el)
          }
        },
        { threshold: 0.1 }
      )

      observer.observe(el)
      return () => observer.disconnect()
    } else {
      el.classList.add('is-visible')
    }
  }, [])

  return ref
}
