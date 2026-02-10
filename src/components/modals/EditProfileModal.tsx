'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload, User, Mail, Phone, MapPin, Globe } from 'lucide-react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  postalCode: string;
  bio?: string;
  avatar?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: ProfileData;
  onSave: (profile: ProfileData) => void;
  userId: string;
}

export default function EditProfileModalWithAPI({
  isOpen,
  onClose,
  currentProfile,
  onSave,
  userId
}: EditProfileModalProps) {
  const [profile, setProfile] = useState<ProfileData>(currentProfile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProfile(currentProfile);
      setAvatarPreview(null);
      setSelectedFile(null);
    }
  }, [isOpen, currentProfile]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const formData = new FormData();
    
    // Ajouter tous les champs du profil
    formData.append('firstName', profile.firstName);
    formData.append('lastName', profile.lastName);
    formData.append('email', profile.email);
    formData.append('phone', profile.phone || '');
    formData.append('country', profile.country || '');
    formData.append('city', profile.city || '');
    formData.append('postalCode', profile.postalCode || '');
    formData.append('bio', profile.bio || '');
    
    // Ajouter l'image si elle a été modifiée
    if (selectedFile) {
      formData.append('profileImage', selectedFile);
    }

    // CHANGEMENT ICI : Utiliser PATCH au lieu de PUT
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PATCH', // ← CHANGER DE PUT À PATCH
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', errorText);
      
      // Afficher plus de détails d'erreur
      console.log('URL appelée:', `${API_URL}/api/users/${userId}`);
      console.log('Méthode:', 'PATCH');
      console.log('Headers:', {
        'Content-Type': 'multipart/form-data'
      });
      
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    const updatedUser = await response.json();
    
    // Mettre à jour l'état local
    onSave(updatedUser);
    
    // Nettoyer et fermer
    setAvatarPreview(null);
    setSelectedFile(null);
    onClose();
    
    // Recharger la page pour voir les changements
    setTimeout(() => window.location.reload(), 500);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Erreur lors de la mise à jour du profil. Vérifiez la console pour plus de détails.');
  } finally {
    setIsSubmitting(false);
  }
};

  // Fonction pour obtenir l'URL de l'image de profil
  const getProfileImageUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (currentProfile.avatar) {
      // Construire l'URL correctement
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return `${baseUrl}/api/users/profile-image/${userId}?t=${new Date().getTime()}`;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Modifier le profil
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
                {getProfileImageUrl() ? (
                  <img
                    src={getProfileImageUrl()!}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
              >
                <Upload size={20} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cliquez pour télécharger une photo
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="Jean"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="Dupont"
                />
              </div>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  required
                  disabled={true}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white opacity-60 cursor-not-allowed"
                  placeholder="jean.dupont@example.com"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pays
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="France"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ville
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="Paris"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={profile.postalCode}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="75001"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={profile.bio || ''}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none disabled:opacity-50"
              placeholder="Parlez-nous de vous..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}