import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function BookingForm() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="First Name" />
        <Input placeholder="Last Name" />
      </div>
      <Input placeholder="Email" type="email" />
      <Input placeholder="Phone" type="tel" />
      <Button className="w-full">Complete Booking</Button>
    </div>
  )
}