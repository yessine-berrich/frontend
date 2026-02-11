'use client';

import { MapPin, Calendar, Globe, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

interface UserAboutCardProps {
  user: {
    bio?: string;
    location?: string;
    joinDate?: string;
    website?: string;
    socialLinks?: {
      facebook?: string | null;
      twitter?: string | null;
      linkedin?: string | null;
      instagram?: string | null;
    };
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

  const hasSocialLinks = user.socialLinks && 
    Object.values(user.socialLinks).some(link => link && link.trim() !== '');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
        À propos
      </h3>
      
      <div className="space-y-4">
        {/* Bio */}
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
          
          {/* Localisation */}
          {user.location && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {user.location}
              </span>
            </div>
          )}
          
          {/* Date d'inscription */}
          {user.joinDate && (
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Membre depuis {formatDate(user.joinDate)}
              </span>
            </div>
          )}

          {/* Site web */}
          {user.website && (
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-gray-400 flex-shrink-0" />
              <a
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
              >
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* Réseaux sociaux */}
          {hasSocialLinks && (
            <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Réseaux sociaux
              </h4>
              <div className="flex flex-wrap gap-3">
                {user.socialLinks?.facebook && (
                  <a
                    href={user.socialLinks.facebook.startsWith('http') 
                      ? user.socialLinks.facebook 
                      : `https://facebook.com/${user.socialLinks.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    title="Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                )}
                
                {user.socialLinks?.twitter && (
                  <a
                    href={user.socialLinks.twitter.startsWith('http') 
                      ? user.socialLinks.twitter 
                      : `https://twitter.com/${user.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
                    title="Twitter"
                  >
                    <Twitter size={16} />
                  </a>
                )}
                
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin.startsWith('http') 
                      ? user.socialLinks.linkedin 
                      : `https://linkedin.com/in/${user.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-700/10 dark:bg-blue-700/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-700/20 dark:hover:bg-blue-700/30 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                
                {user.socialLinks?.instagram && (
                  <a
                    href={user.socialLinks.instagram.startsWith('http') 
                      ? user.socialLinks.instagram 
                      : `https://instagram.com/${user.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                    title="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}