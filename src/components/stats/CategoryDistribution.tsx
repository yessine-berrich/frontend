'use client';

import { useState } from 'react';

interface CategoryData {
  name: string;
  percentage: number;
  color: string;
  count: number;
}

const categories: CategoryData[] = [
  { name: 'Frontend', percentage: 35, color: '#3b82f6', count: 55 },
  { name: 'Backend', percentage: 28, color: '#10b981', count: 44 },
  { name: 'DevOps', percentage: 18, color: '#f97316', count: 28 },
  { name: 'Database', percentage: 12, color: '#8b5cf6', count: 19 },
  { name: 'Autres', percentage: 7, color: '#6b7280', count: 10 },
];

export default function CategoryDistribution() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate SVG donut segments
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  const segments = categories.map((category) => {
    const dashLength = (category.percentage / 100) * circumference;
    const dashOffset = circumference - currentOffset;
    currentOffset += dashLength;

    return {
      ...category,
      dashLength,
      dashOffset,
    };
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Répartition par catégorie
      </h3>

      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="30"
              className="dark:stroke-gray-800"
            />

            {/* Segments */}
            {segments.map((segment, index) => (
              <circle
                key={segment.name}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="30"
                strokeDasharray={`${segment.dashLength} ${circumference}`}
                strokeDashoffset={segment.dashOffset}
                className={`transition-all duration-300 cursor-pointer ${
                  hoveredIndex === index ? 'opacity-80' : 'opacity-100'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  filter: hoveredIndex === index ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'none',
                }}
              />
            ))}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {categories.reduce((sum, cat) => sum + cat.count, 0)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Articles</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full mt-8 space-y-3">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                hoveredIndex === index
                  ? 'bg-gray-50 dark:bg-gray-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {category.count} articles
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {category.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}