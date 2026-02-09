'use client';

import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import StatsMetrics from '@/components/stats/StatsMetrics';
import TrafficChart from '@/components/stats/TrafficChart';
import PublicationActivity from '@/components/stats/PublicationActivity';
import CategoryDistribution from '@/components/stats/CategoryDistribution';
import TopArticles from '@/components/stats/TopArticles';

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState('7 derniers jours');

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting statistics...');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Statistiques
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble des performances de la plateforme
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="7 derniers jours">7 derniers jours</option>
              <option value="30 derniers jours">30 derniers jours</option>
              <option value="3 derniers mois">3 derniers mois</option>
              <option value="6 derniers mois">6 derniers mois</option>
              <option value="12 derniers mois">12 derniers mois</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <StatsMetrics />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <TrafficChart />

        {/* Publication Activity */}
        <PublicationActivity />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="lg:col-span-1">
          <CategoryDistribution />
        </div>

        {/* Top Articles */}
        <div className="lg:col-span-2">
          <TopArticles />
        </div>
      </div>
    </div>
  );
}