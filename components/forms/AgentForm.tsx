import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function AgentForm() {
  return (
    <div className="space-y-4">
      <Input placeholder="License Number" />
      <Input placeholder="Agency" />
      <Input placeholder="Years of Experience" type="number" />
      <Button>Save Agent Info</Button>
    </div>
  )
}