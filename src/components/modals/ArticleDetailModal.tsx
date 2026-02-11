'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Eye, Share2, Bookmark } from 'lucide-react';
import MarkdownPreview from '../markdoun-editor/MarkdownPreview';
import CommentsSection from '../comments/commentsSection';

interface Article {
  id: string;
  title: string;
  content: string;
  description: string;
  author: {
    id?: number;
    name: string;
    initials: string;
    department: string;
    avatar?: string;
  };
  category: {
    name: string;
    slug: string;
  };
  tags: string[];
  isFeatured?: boolean;
  publishedAt: string;
  updatedAt?: string;
  status: 'draft' | 'published' | 'pending';
  stats: {
    likes: number;
    comments: number;
    views: number;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface ArticleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
  currentUserId?: number;
  userToken?: string;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

export default function ArticleDetailModal({
  isOpen,
  onClose,
  article,
  onLike,
  onBookmark,
  onShare,
}: ArticleDetailModalProps) {
  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(article.stats.likes);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  };

  const handleShare = () => {
    onShare?.();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href,
      });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) {
      return `il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
    } else if (diffInDays > 0) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return 'il y a quelques minutes';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return { text: 'Publié', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' };
      case 'pending':
        return { text: 'En attente', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' };
      case 'draft':
        return { text: 'Brouillon', color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400' };
      default:
        return { text: status, color: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400' };
    }
  };

  const statusBadge = getStatusBadge(article.status);

  if (!isOpen) return null;

  const getProfileImageUrl = (userData: any) => {
    // if (!userData?.id) return "/images/user/owner.jpg";
    
    // Si l'utilisateur a une image de profil dans la base de données
    if (userData?.avatar) {
      // On ajoute un timestamp (?t=...) pour forcer le navigateur à ignorer le cache après un update
      return `http://localhost:3000/api/users/profile-image/${userData.id}?t=${new Date().getTime()}`;
    }
    
    // Image par défaut si pas d'image de profil
    // return "/images/user/owner.jpg";
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-gray-200 dark:border-gray-800">
          {/* Author Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
              {article.author.avatar ? (
                <img
                  src={getProfileImageUrl(article.author)}
                  alt={article.author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                article.author.initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {article.author.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{article.author.department}</span>
                <span>•</span>
                <span>{getTimeAgo(article.publishedAt)}</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Article Content */}
          <div className="p-6 space-y-6">
            {/* Category & Featured & Status */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
                {article.category.name}
              </span>
              {article.isFeatured && (
                <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-full">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L3 5l3.5-.5z" />
                  </svg>
                  Featured
                </span>
              )}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusBadge.color}`}>
                {statusBadge.text}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {article.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {article.description}
            </p>

            {/* Article Content */}
            <div className="prose dark:prose-invert max-w-none">
              <MarkdownPreview content={article.content} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200 dark:border-gray-800">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats & Update Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{article.stats.views} vues</span>
              </div>
              {article.updatedAt && article.updatedAt !== article.publishedAt && (
                <>
                  <span>•</span>
                  <span>Mis à jour {getTimeAgo(article.updatedAt)}</span>
                </>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <CommentsSection articleId={parseInt(article.id)}
          />
        </div>

        {/* Footer - Actions */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors group/like"
                aria-label={isLiked ? "Retirer le like" : "Aimer l'article"}
              >
                <Heart
                  size={20}
                  className={`transition-all ${
                    isLiked ? 'fill-red-500 text-red-500 animate-pulse' : 'group-hover/like:scale-110'
                  }`}
                />
                <span className="text-sm font-medium">{likesCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                title="Partager"
                aria-label="Partager l'article"
              >
                <Share2 size={20} />
                <span className="text-sm font-medium hidden sm:inline">Partager</span>
              </button>
            </div>

            {/* Main Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-all ${
                  isBookmarked
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400'
                }`}
                title={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
                aria-label={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Bookmark
                  size={20}
                  className={isBookmarked ? 'fill-yellow-500' : ''}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}