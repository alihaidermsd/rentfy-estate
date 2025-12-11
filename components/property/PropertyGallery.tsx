export function PropertyGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 aspect-video bg-muted rounded-lg"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-square bg-muted rounded-lg"></div>
        <div className="aspect-square bg-muted rounded-lg"></div>
        <div className="aspect-square bg-muted rounded-lg"></div>
        <div className="aspect-square bg-muted rounded-lg"></div>
      </div>
    </div>
  )
}