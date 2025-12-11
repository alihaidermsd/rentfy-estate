import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AreaExplorer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Explore the Area</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>Restaurants: 15 within 1 mile</div>
          <div>Schools: 3 within 2 miles</div>
          <div>Parks: 2 within 0.5 miles</div>
        </div>
      </CardContent>
    </Card>
  )
}