import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div>
                <p className="text-sm">New booking for Property {i}</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}