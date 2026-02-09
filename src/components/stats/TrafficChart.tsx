'use client';

import { useState } from 'react';

const weekData = [
  { day: 'Lun', vues: 1200, visiteurs: 800 },
  { day: 'Mar', vues: 1850, visiteurs: 1100 },
  { day: 'Mer', vues: 2200, visiteurs: 1450 },
  { day: 'Jeu', vues: 1900, visiteurs: 1250 },
  { day: 'Ven', vues: 2600, visiteurs: 1700 },
  { day: 'Sam', vues: 1400, visiteurs: 900 },
  { day: 'Dim', vues: 1100, visiteurs: 700 },
];

export default function TrafficChart() {
  const [activeMetric, setActiveMetric] = useState<'vues' | 'visiteurs'>('vues');

  const maxValue = Math.max(...weekData.map(d => Math.max(d.vues, d.visiteurs)));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trafic
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cette semaine
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => setActiveMetric('vues')}
            className={`flex items-center gap-2 transition-opacity ${
              activeMetric === 'vues' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Vues</span>
          </button>
          <button
            onClick={() => setActiveMetric('visiteurs')}
            className={`flex items-center gap-2 transition-opacity ${
              activeMetric === 'visiteurs' ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span className="text-gray-700 dark:text-gray-300">Visiteurs</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-12 right-0 top-0 bottom-8 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-gray-100 dark:border-gray-800"></div>
          ))}
        </div>

        {/* Bars */}
        <div className="absolute left-12 right-0 top-0 bottom-8 flex items-end justify-around gap-2">
          {weekData.map((data, index) => {
            const vuesHeight = (data.vues / maxValue) * 100;
            const visiteursHeight = (data.visiteurs / maxValue) * 100;

            return (
              <div key={data.day} className="flex-1 flex items-end justify-center gap-1 group">
                {/* Vues bar */}
                <div
                  className={`relative flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:opacity-80 ${
                    activeMetric === 'vues' ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{ height: `${vuesHeight}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {data.vues} vues
                  </div>
                </div>

                {/* Visiteurs bar */}
                <div
                  className={`relative flex-1 bg-gradient-to-t from-purple-400 to-purple-300 rounded-t transition-all duration-300 hover:opacity-80 ${
                    activeMetric === 'visiteurs' ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{ height: `${visiteursHeight}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {data.visiteurs} visiteurs
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-12 right-0 bottom-0 h-8 flex items-center justify-around text-xs text-gray-600 dark:text-gray-400">
          {weekData.map((data) => (
            <div key={data.day} className="flex-1 text-center">
              {data.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}