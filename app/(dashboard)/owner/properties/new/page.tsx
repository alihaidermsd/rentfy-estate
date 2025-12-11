"use client"

import { PropertyForm } from '@/components/forms/PropertyForm'

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-2">List your property for rent or sale</p>
        </div>
      </div>

      <PropertyForm />
    </div>
  )
}