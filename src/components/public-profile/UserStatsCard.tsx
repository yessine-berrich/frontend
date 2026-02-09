// components/user-profile/UserStatsCard.tsx
'use client';

import { BookOpen, Heart, Award, Star } from 'lucide-react';

interface UserStatsCardProps {
  stats: {
    totalArticles: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
  };
}

export default function UserStatsCard({ stats }: UserStatsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        Statistiques
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Articles publiés */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats.totalArticles}
              </h4>
              <span className="text-sm text-blue-600 dark:text-blue-300">
                Articles
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {stats.totalArticles > 0 
                  ? Math.round((stats.totalLikes + stats.totalComments) / stats.totalArticles)
                  : 0}
              </h4>
              <span className="text-sm text-purple-600 dark:text-purple-300">
                Engagement
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Likes reçus */}
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-red-700 dark:text-red-400">
                {stats.totalLikes}
              </h4>
              <span className="text-sm text-red-600 dark:text-red-300">
                J'aime
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
              <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Popularité */}
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats.totalArticles > 0 
                  ? Math.round(stats.totalViews / stats.totalArticles)
                  : 0}
              </h4>
              <span className="text-sm text-yellow-600 dark:text-yellow-300">
                Vues/article
              </span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-800">
              <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}