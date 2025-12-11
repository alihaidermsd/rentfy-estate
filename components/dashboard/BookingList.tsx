import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BookingList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-semibold">Booking #{i}</h4>
                <p className="text-sm text-muted-foreground">Property {i}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$450</p>
                <p className="text-sm text-muted-foreground">Apr 12-17, 2024</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}