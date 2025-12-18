'use client';

import { useSearchParams } from 'next/navigation';

export default function SortDropdown() {
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    window.location.href = `/properties?${params.toString()}`;
  };

  return (
    <select
      defaultValue={`${searchParams.get('sortBy') || 'createdAt'}-${searchParams.get('sortOrder') || 'desc'}`}
      onChange={handleSortChange}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="createdAt-desc">Newest First</option>
      <option value="createdAt-asc">Oldest First</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rentPrice-asc">Rent: Low to High</option>
      <option value="rentPrice-desc">Rent: High to Low</option>
      <option value="rating-desc">Highest Rated</option>
    </select>
  );
}
