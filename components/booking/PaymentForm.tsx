import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PaymentForm() {
  return (
    <div className="space-y-4">
      <Input placeholder="Card Number" />
      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="MM/YY" />
        <Input placeholder="CVC" />
      </div>
      <Input placeholder="Cardholder Name" />
      <Button className="w-full">Pay Now</Button>
    </div>
  )
}