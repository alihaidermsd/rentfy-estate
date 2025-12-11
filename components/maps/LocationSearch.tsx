import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LocationSearch() {
  return (
    <div className="flex space-x-2">
      <Input placeholder="Enter location..." />
      <Button>Search</Button>
    </div>
  )
}