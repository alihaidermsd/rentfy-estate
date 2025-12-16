import BookMeClient from '@/components/bookme/BookMeClient';
import { prisma } from '@/lib/prisma';

export default async function BookMePage() {
  const propertiesRaw = await prisma.property.findMany({
    where: { isActive: true, status: { not: 'DRAFT' } },
    take: 50,
    include: { user: true },
  });

  const properties = propertiesRaw.map((p: any) => ({
    ...p,
    images: typeof p.images === 'string' ? p.images.split(',').filter((s: string) => s.trim()) : Array.isArray(p.images) ? p.images : [],
  }));

  return <BookMeClient properties={properties} />;
}
