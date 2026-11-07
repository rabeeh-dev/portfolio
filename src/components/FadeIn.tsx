import React from 'react'
import { useFadeIn } from '@/hooks/useFadeIn'

interface FadeInProps {
  children: React.ReactNode
  className?: string
}

export function FadeIn({ children, className = '' }: FadeInProps) {
  const ref = useFadeIn()
  return (
    <div ref={ref} className={`fade-in-section ${className}`}>
      {children}
    </div>
  )
}
