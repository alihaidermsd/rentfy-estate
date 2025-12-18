// components/ui/Pagination.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  queryParams = {},
}: PaginationProps) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams({
      ...queryParams,
      page: page.toString(),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <Link
        href={getPageUrl(currentPage - 1)}
        className={`flex items-center px-3 py-2 rounded-lg border ${
          currentPage === 1
            ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        onClick={(e) => currentPage === 1 && e.preventDefault()}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="ml-1">Previous</span>
      </Link>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-gray-500"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Link
            key={pageNum}
            href={getPageUrl(pageNum)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium ${
              isActive
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* Next Button */}
      <Link
        href={getPageUrl(currentPage + 1)}
        className={`flex items-center px-3 py-2 rounded-lg border ${
          currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        onClick={(e) => currentPage === totalPages && e.preventDefault()}
      >
        <span className="mr-1">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}