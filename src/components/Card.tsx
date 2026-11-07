import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export function Card({ children, className = '', id }: CardProps) {
  return (
    <div
      id={id}
      className={`bg-card-light dark:bg-card-dark rounded-card px-6 py-8 md:px-10 md:py-10 ${className}`}
    >
      {children}
    </div>
  )
}
