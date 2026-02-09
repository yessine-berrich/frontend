// components/user-profile/UserAboutCard.tsx
'use client';

import { MapPin, Calendar, Globe } from 'lucide-react';

interface UserAboutCardProps {
  user: {
    bio?: string;
    location?: string;
    joinDate?: string;
    website?: string;
  };
}

export default function UserAboutCard({ user }: UserAboutCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        À propos
      </h3>
      <div className="space-y-4">
        {user.bio ? (
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {user.bio}
          </p>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 italic">
            Aucune biographie disponible
          </p>
        )}

        {/* Informations détaillées */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          {user.location && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {user.location}
              </span>
            </div>
          )}
          
          {user.joinDate && (
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Membre depuis {formatDate(user.joinDate)}
              </span>
            </div>
          )}

          {user.website && (
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-gray-400" />
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}