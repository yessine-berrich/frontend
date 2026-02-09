'use client';

import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  views: number;
  change: number;
  trend: 'up' | 'down';
}

const topArticles: Article[] = [
  {
    id: '1',
    title: 'Introduction à React 18',
    views: 2450,
    change: 12,
    trend: 'up',
  },
  {
    id: '2',
    title: 'Docker pour les débutants',
    views: 1890,
    change: 8,
    trend: 'up',
  },
  {
    id: '3',
    title: 'TypeScript Best Practices',
    views: 1670,
    change: 15,
    trend: 'up',
  },
  {
    id: '4',
    title: 'Architecture Microservices',
    views: 1420,
    change: -3,
    trend: 'down',
  },
  {
    id: '5',
    title: 'PostgreSQL Optimization',
    views: 1280,
    change: 22,
    trend: 'up',
  },
];

export default function TopArticles() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Articles les plus consultés
        </h3>
        <button className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          Voir tout
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {topArticles.map((article, index) => (
          <div
            key={article.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400">
              {index + 1}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {article.views.toLocaleString()} vues
              </p>
            </div>

            {/* Change Badge */}
            <div
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                article.trend === 'up'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              {article.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(article.change)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}