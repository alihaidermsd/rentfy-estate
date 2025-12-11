"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function FavoriteButton() {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsFavorite(!isFavorite)}
    >
      {isFavorite ? '♥' : '♡'}
    </Button>
  )
}