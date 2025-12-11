import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PriceHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          Price history chart would go here
        </div>
      </CardContent>
    </Card>
  )
}