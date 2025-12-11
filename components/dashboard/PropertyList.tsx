import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PropertyList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <h4 className="font-semibold">Property {i}</h4>
                <p className="text-sm text-muted-foreground">Status: Available</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">$1,200/mo</p>
                <p className="text-sm text-muted-foreground">2 bookings</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}