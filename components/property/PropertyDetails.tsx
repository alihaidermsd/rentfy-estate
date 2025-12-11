import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PropertyDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold">Overview</h4>
            <p className="text-sm text-muted-foreground">Beautiful modern apartment in the heart of the city.</p>
          </div>
          <div>
            <h4 className="font-semibold">Features</h4>
            <ul className="text-sm text-muted-foreground">
              <li>Swimming Pool</li>
              <li>Gym</li>
              <li>Parking</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}