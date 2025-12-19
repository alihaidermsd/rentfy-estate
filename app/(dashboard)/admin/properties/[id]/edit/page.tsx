"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { getProperty } from "@/lib/properties"; // This function needs to be created
import { Property } from "@/types/property";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function EditPropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === "string") {
      const fetchProperty = async () => {
        try {
          const data = await getProperty(id);
          setProperty(data);
        } catch (err) {
          setError("Failed to fetch property data.");
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!property) {
    return <p>Property not found.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
      <PropertyForm initialData={property} />
    </div>
  );
}
