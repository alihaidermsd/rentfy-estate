"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
        <MenuIcon />
      </Button>
      
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background border-b p-4">
          <nav className="space-y-4">
            <Button variant="ghost" className="w-full justify-start">Buy</Button>
            <Button variant="ghost" className="w-full justify-start">Rent</Button>
            <Button variant="ghost" className="w-full justify-start">Sell</Button>
            <Button variant="ghost" className="w-full justify-start">Agents</Button>
          </nav>
        </div>
      )}
    </div>
  )
}

function MenuIcon(props: any) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> }