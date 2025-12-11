import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchForm() {
  return (
    <div className="flex space-x-2">
      <Input placeholder="Search properties..." className="flex-1" />
      <Button>Search</Button>
    </div>
  )
}