import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PropertyForm() {
  return (
    <div className="space-y-4">
      <Input placeholder="Property Title" />
      <Input placeholder="Location" />
      <div className="grid grid-cols-3 gap-4">
        <Input placeholder="Price" type="number" />
        <Input placeholder="Bedrooms" type="number" />
        <Input placeholder="Bathrooms" type="number" />
      </div>
      <Input placeholder="Area (sqft)" type="number" />
      <Button className="w-full">Save Property</Button>
    </div>
  )
}