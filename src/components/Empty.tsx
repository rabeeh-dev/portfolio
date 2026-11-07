interface EmptyProps {
  message?: string
}

export function Empty({ message = 'Nothing here yet.' }: EmptyProps) {
  return (
    <div className="text-center py-16 text-body-light dark:text-body-dark">
      <p className="text-lg">{message}</p>
    </div>
  )
}
