import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function BookingConfirmation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Confirmed!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Your booking has been confirmed. You will receive an email with all the details.</p>
        <Button className="w-full">View Booking Details</Button>
      </CardContent>
    </Card>
  )
}