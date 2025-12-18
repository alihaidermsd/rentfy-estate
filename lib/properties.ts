import { Property } from "@/types/property";

export async function getProperty(id: string): Promise<Property> {
  const res = await fetch(`/api/properties/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch property");
  }
  return res.json();
}
