'use client';

import React from 'react';
import { Trophy, Star, Award, TrendingUp, BookOpen } from 'lucide-react';

interface TopContributor {
  id: string;
  name: string;
  initials: string;
  articlesCount: number;
  rank?: number;
  department?: string;
  score?: number;
}

interface TopContributorsProps {
  contributors?: TopContributor[];
  title?: string;
  maxItems?: number;
}

const defaultContributors: TopContributor[] = [
  {
    id: '1',
    name: 'Sophie Laurent',
    initials: 'SL',
    articlesCount: 32,
    rank: 1,
    department: 'Développement',
    score: 95,
  },
  {
    id: '2',
    name: 'Jean Dupont',
    initials: 'JD',
    articlesCount: 24,
    rank: 2,
    department: 'Design',
    score: 88,
  },
  {
    id: '3',
    name: 'Marie Martin',
    initials: 'MM',
    articlesCount: 12,
    rank: 3,
    department: 'Marketing',
    score: 76,
  },
  
];

const getRankBadge = (rank?: number) => {
  switch (rank) {
    case 1:
      return {
        bg: 'bg-gradient-to-br from-yellow-400 to-orange-500',
        icon: <Trophy className="h-4 w-4" />,
        text: 'text-white',
      };
    case 2:
      return {
        bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
        icon: <Award className="h-4 w-4" />,
        text: 'text-white',
      };
    case 3:
      return {
        bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
        icon: <Star className="h-4 w-4" />,
        text: 'text-white',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        icon: <TrendingUp className="h-4 w-4 text-gray-400" />,
        text: 'text-gray-700 dark:text-gray-300',
      };
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 80) return 'text-blue-600 dark:text-blue-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-gray-600 dark:text-gray-400';
};

export default function TopContributors({
  contributors = defaultContributors,
  title = 'Top contributeurs',
  maxItems = 5,
}: TopContributorsProps) {
  const displayedContributors = contributors.slice(0, maxItems);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
            <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Meilleurs contributeurs du mois
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
          🏆 Classement
        </span>
      </div>

      {/* Contributors List */}
      <div className="space-y-4">
        {displayedContributors.map((contributor) => {
          const rankBadge = getRankBadge(contributor.rank);
          
          return (
            <div
              key={contributor.id}
              className="group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Avatar with Rank */}
                <div className="relative">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${rankBadge.bg} ${rankBadge.text} font-semibold text-base shadow-sm group-hover:scale-105 transition-transform duration-200`}
                  >
                    {contributor.rank ? rankBadge.icon : contributor.initials}
                  </div>
                  
                  {/* Rank Badge */}
                  {contributor.rank && contributor.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-900 border-2 border-white dark:border-gray-900 shadow-md">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {contributor.rank}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contributor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {contributor.name}
                    </h4>
                    {contributor.score && (
                      <span className={`text-xs font-bold ${getScoreColor(contributor.score)}`}>
                        {contributor.score}%
                      </span>
                    )}
                  </div>
                  
                  {contributor.department && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {contributor.department}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {contributor.articlesCount}
                      </span>
                      <span>articles</span>
                    </div>
                    
                    {/* Progress Bar */}
                    {contributor.score && (
                      <div className="flex-1 max-w-20">
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              contributor.score >= 90 ? 'bg-green-500' :
                              contributor.score >= 80 ? 'bg-blue-500' :
                              contributor.score >= 70 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${contributor.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Level Indicator */}
                {contributor.rank && contributor.rank <= 3 ? (
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex flex-col items-center">
                      <div className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded">
                        Niveau {contributor.rank}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">Expert</div>
                    </div>
                  </div>
                ) : (
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Basé sur la qualité et quantité des contributions</span>
          <button className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
            Voir tout →
          </button>
        </div>
      </div>
    </div>
  );
}