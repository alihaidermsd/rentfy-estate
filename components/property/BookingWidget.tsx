import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function BookingWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Property</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Check-in</label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Check-out</label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Guests</label>
          <Input type="number" defaultValue={2} />
        </div>
        <Button className="w-full">Book Now</Button>
      </CardContent>
    </Card>
  )
}