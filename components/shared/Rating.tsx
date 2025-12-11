export function Rating({ value = 0 }: { value?: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-primary">
          {star <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}