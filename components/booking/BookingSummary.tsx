import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BookingSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>$200 x 5 nights</span>
          <span>$1,000</span>
        </div>
        <div className="flex justify-between">
          <span>Cleaning fee</span>
          <span>$50</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-4">
          <span>Total</span>
          <span>$1,050</span>
        </div>
      </CardContent>
    </Card>
  )
}