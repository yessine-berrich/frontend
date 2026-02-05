'use client';

import React from 'react';
import { TrendingUp, Eye, Heart } from 'lucide-react';

interface TrendingArticle {
  id: string;
  title: string;
  views: number;
  likes: number;
  category?: string;
}

interface TrendingArticlesProps {
  articles?: TrendingArticle[];
  title?: string;
  maxItems?: number;
}

const defaultArticles: TrendingArticle[] = [
  {
    id: '1',
    title: 'Nouvelles politiques RH : Télétravail et flexibilité',
    views: 2340,
    likes: 89,
    category: 'RH',
  },
  {
    id: '2',
    title: 'Guide complet pour démarrer avec React et TypeScript en entreprise',
    views: 1250,
    likes: 42,
    category: 'Développement',
  },
  {
    id: '3',
    title: "Best practices pour le design system de l'entreprise",
    views: 890,
    likes: 34,
    category: 'Design',
  },
 
];

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg';
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-white';
    case 3:
      return 'bg-gradient-to-br from-amber-700 to-amber-800 text-white';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export default function TrendingArticles({
  articles = defaultArticles,
  title = 'Articles tendances',
  maxItems = 5,
}: TrendingArticlesProps) {
  const displayedArticles = articles.slice(0, maxItems);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
            <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Les plus populaires cette semaine
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
          🔥 Tendance
        </span>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {displayedArticles.map((article, index) => (
          <div
            key={article.id}
            className="group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${getRankColor(
                    index + 1
                  )} font-bold text-sm transition-transform group-hover:scale-110`}
                >
                  {index + 1}
                </div>
              </div>

              {/* Article Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {article.category && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {article.category}
                    </span>
                  )}
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed">
                  {article.title}
                </h4>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatNumber(article.views)}
                    </span>
                    <span>vues</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Heart className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatNumber(article.likes)}
                    </span>
                    <span>j'aime</span>
                  </div>
                </div>
              </div>

              {/* Trending Arrow */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Mis à jour il y a 2 heures • Basé sur l'engagement des lecteurs
        </p>
      </div>
    </div>
  );
}