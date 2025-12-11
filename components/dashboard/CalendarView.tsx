import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CalendarView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          Calendar view would be displayed here
        </div>
      </CardContent>
    </Card>
  )
}