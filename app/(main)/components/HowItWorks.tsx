'use client';

import { Search, Home, FileCheck, Key } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Search Properties',
    description: 'Browse through thousands of verified properties with detailed information.',
    icon: Search,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 2,
    title: 'Schedule Viewing',
    description: 'Book a convenient time to visit properties with our verified agents.',
    icon: Home,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 3,
    title: 'Complete Paperwork',
    description: 'We handle all legal documentation and verification processes.',
    icon: FileCheck,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 4,
    title: 'Move In',
    description: 'Get your keys and move into your new home hassle-free.',
    icon: Key,
    color: 'bg-purple-100 text-purple-600',
  },
];

export default function HowItWorks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <div key={step.id} className="text-center">
            <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className="h-8 w-8" />
            </div>
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                {step.id}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        );
      })}
    </div>
  );
}