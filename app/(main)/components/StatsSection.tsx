'use client';

import { useEffect, useState } from 'react';
import { Users, Home, DollarSign, Award } from 'lucide-react';
import CountUp from 'react-countup';

interface StatsSectionProps {
  stats: {
    totalProperties: number;
    featuredProperties: number;
  };
}

// Define the stats array with proper typing
const defaultStats = [
  {
    id: 1,
    name: 'Total Properties',
    value: 0,
    icon: Home,
    color: 'bg-blue-500',
    suffix: '+',
  },
  {
    id: 2,
    name: 'Happy Customers',
    value: 0,
    icon: Users,
    color: 'bg-green-500',
    suffix: '+',
  },
  {
    id: 3,
    name: 'Properties Sold',
    value: 0,
    icon: DollarSign,
    color: 'bg-yellow-500',
    suffix: '+',
  },
  {
    id: 4,
    name: 'Featured Listings',
    value: 0,
    icon: Award,
    color: 'bg-purple-500',
    suffix: '',
  },
] as const;

type StatItem = {
  id: number;
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  suffix: string;
};

export default function StatsSection({ stats }: StatsSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update stats with real data - map over defaultStats array, not stats object
  const updatedStats: StatItem[] = defaultStats.map((stat, index) => {
    if (index === 0) {
      return { ...stat, value: stats.totalProperties };
    }
    if (index === 3) {
      return { ...stat, value: stats.featuredProperties };
    }
    return { ...stat };
  });

  if (!mounted) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {updatedStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2.5}
                    separator=","
                    suffix={stat.suffix}
                  />
                </div>
                <div className="text-gray-600">{stat.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}