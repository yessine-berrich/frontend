// components/user-profile/EditableUserProfileHeader.tsx
'use client';

import { Heart, MessageCircle, Eye, Mail, Edit, Camera } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface EditableUserProfileHeaderProps {
  user: {
    id?: string;
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
  isCurrentUser?: boolean;
  onEditClick?: () => void;
  onImageChange?: (file: File) => void;
}

export default function EditableUserProfileHeader({ 
  user, 
  stats,
  isCurrentUser = false,
  onEditClick,
  onImageChange
}: EditableUserProfileHeaderProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

const getProfileImageUrl = (): string => {
  if (previewImage) {
    return previewImage;
  }
    if (!user?.profileImage) {
    return "/images/user/owner.jpg";
  }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    if (!user.id) {
    return "/images/user/owner.jpg";
  }
  
  const url = `${API_URL}/api/users/profile-image/${user.id}?t=${new Date().getTime()}`;
  
  return url;
};

  // Gère l'aperçu de l'image avant l'envoi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image est trop volumineuse. Maximum 5MB.');
        return;
      }
      
      // Vérifier le type de fichier
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Format d\'image non supporté. Utilisez JPEG, PNG, GIF ou WebP.');
        return;
      }
      
      // Créer une URL d'aperçu
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      // Appeler le callback parent pour le traitement de l'image
      if (onImageChange) {
        onImageChange(file);
      }
    }
  };

  // Nettoyage de la mémoire quand le composant est démonté
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Récupérer les initiales pour l'affichage de secours
  const getInitials = () => {
    return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Avatar avec fonctionnalité d'upload */}
        <div className="flex-shrink-0">
          <div 
           
          >
            <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full overflow-hidden shadow-xl border-4 border-white dark:border-gray-800">
              <Image
                fill
                src={getProfileImageUrl()}
                alt={`${user.firstName} ${user.lastName}`}
                className="object-cover"
                unoptimized // Important pour les images servies par une API de dev
                onError={(e) => {
                  // Fallback en cas d'erreur de chargement d'image
                  e.currentTarget.src = "/images/user/profile.jpg";
                }}
              />
              
              {/* Affichage des initiales en arrière-plan au cas où l'image ne charge pas */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-2xl opacity-0">
                  {getInitials()}
                </span>
              </div>
              
            </div>

            {/* Bouton d'upload (visible uniquement pour l'utilisateur connecté) */}
            {isCurrentUser && (
              <>
                <input
                  type="file"
                  id="profile-image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="profile-image-upload"
                  className={`absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full cursor-pointer transition-all duration-300 ${
                    isHovering ? 'scale-110 shadow-lg' : 'scale-100'
                  }`}
                >
                  <Camera size={20} />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user.firstName} {user.lastName}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                {user.role} • {user.department}
              </p>
            </div>

            {/* Bouton Modifier (visible uniquement pour l'utilisateur connecté) */}
            {isCurrentUser && onEditClick && (
              <button
                onClick={onEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Edit size={16} />
                <span className="hidden sm:inline">Modifier le profil</span>
              </button>
            )}
          </div>

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

          {/* Actions (uniquement pour les autres utilisateurs) */}
          {!isCurrentUser && (
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
          )}
        </div>
      </div>

      {/* Indicateur de chargement pour l'image */}
      {isCurrentUser && previewImage && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm rounded-lg flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Image sélectionnée. Cliquez sur "Modifier le profil" pour sauvegarder.</span>
        </div>
      )}
    </div>
  );
}