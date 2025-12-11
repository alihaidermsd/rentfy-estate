interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-destructive/15 text-destructive p-4 rounded-lg">
      {message}
    </div>
  )
}