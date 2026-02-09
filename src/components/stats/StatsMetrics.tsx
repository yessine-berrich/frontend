'use client';

import { Eye, FileText, Users, Heart, TrendingUp, TrendingDown } from 'lucide-react';

interface Metric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: 'views' | 'articles' | 'users' | 'engagement';
  color: string;
}

const metrics: Metric[] = [
  {
    id: '1',
    label: 'Vues totales',
    value: '12,847',
    change: 12,
    trend: 'up',
    icon: 'views',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    label: 'Articles publiés',
    value: '156',
    change: 8,
    trend: 'up',
    icon: 'articles',
    color: 'bg-green-500',
  },
  {
    id: '3',
    label: 'Utilisateurs actifs',
    value: '324',
    change: 15,
    trend: 'up',
    icon: 'users',
    color: 'bg-purple-500',
  },
  {
    id: '4',
    label: 'Engagement',
    value: '2,156',
    change: -3,
    trend: 'down',
    icon: 'engagement',
    color: 'bg-pink-500',
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'views':
      return <Eye className="w-6 h-6" />;
    case 'articles':
      return <FileText className="w-6 h-6" />;
    case 'users':
      return <Users className="w-6 h-6" />;
    case 'engagement':
      return <Heart className="w-6 h-6" />;
    default:
      return <Eye className="w-6 h-6" />;
  }
};

export default function StatsMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${metric.color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center`}>
              <div className={`${metric.color.replace('bg-', 'text-')}`}>
                {getIcon(metric.icon)}
              </div>
            </div>
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                metric.trend === 'up'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              {metric.trend === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(metric.change)}%
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {metric.label}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {metric.value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}