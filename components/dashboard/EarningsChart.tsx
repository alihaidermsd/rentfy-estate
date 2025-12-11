import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EarningsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Earnings chart would be displayed here
        </div>
      </CardContent>
    </Card>
  )
}