import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="flex space-x-1">
      <Button variant="ghost" className="flex-col h-auto py-2">
        <Home className="w-4 h-4 mb-1" />
        <span className="text-xs">Home</span>
      </Button>
      <Button variant="ghost" className="flex-col h-auto py-2">
        <Search className="w-4 h-4 mb-1" />
        <span className="text-xs">Search</span>
      </Button>
      <Button variant="ghost" className="flex-col h-auto py-2">
        <Heart className="w-4 h-4 mb-1" />
        <span className="text-xs">Favorites</span>
      </Button>
      <Button variant="ghost" className="flex-col h-auto py-2">
        <User className="w-4 h-4 mb-1" />
        <span className="text-xs">Profile</span>
      </Button>
    </nav>
  )
}

function Home(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function Search(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> }
function Heart(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> }
function User(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }