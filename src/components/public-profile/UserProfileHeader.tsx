// components/user-profile/UserProfileHeader.tsx
'use client';

import { Heart, MessageCircle, Eye, Mail } from 'lucide-react';

interface UserProfileHeaderProps {
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
    role: string;
    department: string;
    email?: string;
  };
  stats: {
    totalArticles: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
  };
}

export default function UserProfileHeader({ user, stats }: UserProfileHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative group">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white dark:border-gray-800 overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user.firstName?.[0] || '') + (user.lastName?.[0] || '')
              )}
            </div>
          </div>
        </div>

        {/* Informations principales */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {user.firstName} {user.lastName}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
            {user.role} • {user.department}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {user.role && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
                {user.role}
              </span>
            )}
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
              {stats.totalArticles} article{stats.totalArticles !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Stats rapides */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Heart size={16} />
              <span>{stats.totalLikes} likes</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MessageCircle size={16} />
              <span>{stats.totalComments} commentaires</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Eye size={16} />
              <span>{stats.totalViews.toLocaleString()} vues</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {user.email && (
              <a
                href={`mailto:${user.email}`}
                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                title="Envoyer un email"
              >
                <Mail size={16} />
                <span className="text-sm">Contacter</span>
              </a>
            )}
            <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Suivre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}