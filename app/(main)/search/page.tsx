import SearchPageClient from './SearchPageClient';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getInitialProperties() {
  try {
    const properties = await prisma.property.findMany({
      where: { isActive: true, status: 'PUBLISHED' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Compute average ratings
    const withRatings = await Promise.all(properties.map(async (p) => {
      const reviews = await prisma.review.findMany({ where: { propertyId: p.id, status: 'APPROVED' }, select: { rating: true } });
      const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
      return { ...p, averageRating: avg, totalReviews: reviews.length };
    }));

    const total = await prisma.property.count({ where: { isActive: true, status: 'PUBLISHED' } });

    return { properties: withRatings, total };
  } catch (error) {
    console.error('Error fetching initial properties for search page:', error);
    return { properties: [], total: 0 };
  }
}

export default async function SearchPage() {
  const { properties, total } = await getInitialProperties();

  return <SearchPageClient initialProperties={properties} initialTotal={total} />;
}