import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function BookingForm() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="Check-in Date" type="date" />
        <Input placeholder="Check-out Date" type="date" />
      </div>
      <Input placeholder="Number of Guests" type="number" />
      <Button className="w-full">Check Availability</Button>
    </div>
  )
}