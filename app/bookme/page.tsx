import BookMeClient from '@/components/bookme/BookMeClient';
import { prisma } from '@/lib/prisma';

export default async function BookMePage() {
  const propertiesRaw = await prisma.property.findMany({
    where: {
      isActive: true,
      status: { not: 'DRAFT' },
      OR: [
        { category: 'BOOKING' },
        { category: 'RENT' },
      ],
    },
    take: 50,
    include: { user: true },
  });

  const properties = propertiesRaw.map((p: any) => {
    let images: string[] = [];
    if (typeof p.images === 'string') {
      try {
        let parsed = JSON.parse(p.images);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('["')) {
          images = parsed.flatMap((item: string) => {
            try {
              return JSON.parse(item);
            } catch {
              return item;
            }
          });
        } else if (Array.isArray(parsed)) {
          images = parsed;
        } else {
          images = p.images.split(',').filter(Boolean);
        }
      } catch (error) {
        images = p.images.split(',').filter(Boolean);
      }
    } else if (Array.isArray(p.images)) {
      images = p.images;
    }

    return {
      ...p,
      images,
    };
  });

  return <BookMeClient properties={properties} />;
}
