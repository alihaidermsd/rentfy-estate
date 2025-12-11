import { Button } from "@/components/ui/button"

export function Pagination() {
  return (
    <div className="flex justify-center space-x-2">
      <Button variant="outline" disabled>Previous</Button>
      <Button variant="outline">1</Button>
      <Button variant="outline">2</Button>
      <Button variant="outline">3</Button>
      <Button variant="outline">Next</Button>
    </div>
  )
}