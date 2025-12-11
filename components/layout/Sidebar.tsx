import { Button } from "@/components/ui/button"

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-6">
        <h2 className="font-semibold mb-6">Dashboard</h2>
        
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            Overview
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Properties
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Bookings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Messages
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Settings
          </Button>
        </nav>
      </div>
    </aside>
  )
}