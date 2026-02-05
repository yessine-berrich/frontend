'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    description: string;
    author: {
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
    status: 'draft' | 'published';
    stats: {
      likes: number;
      comments: number;
      views: number;
    };
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function ArticleCard({ 
  article, 
  onLike, 
  onBookmark, 
  onShare,
  onEdit,
  onDelete,
  showActions = true 
}: ArticleCardProps) {
  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(article.stats.likes);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(article.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(article.id);
  };

  const handleShare = () => {
    onShare?.(article.id);
    // You can also implement native share API here
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href + '/article/' + article.id,
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
      return `il y a environ ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
    } else if (diffInDays > 0) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return 'il y a quelques minutes';
    }
  };

  return (
    <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
            {article.author.avatar ? (
              <img 
                src={article.author.avatar} 
                alt={article.author.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              article.author.initials
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {article.author.name}
              </h3>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {article.author.department}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{getTimeAgo(article.publishedAt)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {article.status === 'published' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-green-500">
                      <circle cx="8" cy="8" r="3" fill="currentColor" />
                    </svg>
                    <span className="text-green-600 dark:text-green-500 font-medium">Publié</span>
                  </>
                ) : (
                  <span className="text-gray-500">Brouillon</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* More Menu */}
        {showActions && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10 animate-slideDown">
                <button
                  onClick={() => {
                    onEdit?.(article.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href + '/article/' + article.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Copier le lien
                </button>
                <button
                  onClick={() => {
                    onDelete?.(article.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category & Featured Badge */}
      <div className="flex items-center gap-2 mb-3">
        <Link 
          href={`/category/${article.category.slug}`}
          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          {article.category.name}
        </Link>
        {article.isFeatured && (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-full">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L3 5l3.5-.5z" />
            </svg>
            Featured
          </span>
        )}
      </div>

      {/* Title & Description */}
      <Link href={`/article/${article.id}`} className="block mb-3 group/link">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors line-clamp-2">
          {article.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {article.description}
        </p>
      </Link>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags.map((tag) => (
          <Link
            key={tag}
            href={`/tag/${tag.replace('#', '')}`}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Footer - Stats & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        {/* Stats */}
        <div className="flex items-center gap-4">
          {/* Likes */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors group/like"
          >
            <Heart
              size={20}
              className={`transition-all ${
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'group-hover/like:scale-110'
              }`}
            />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          {/* Comments */}
          <Link
            href={`/article/${article.id}`}
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{article.stats.comments}</span>
          </Link>

          {/* Views */}
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Eye size={20} />
            <span className="text-sm font-medium">{article.stats.views}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"
            aria-label="Bookmark"
          >
            <Bookmark
              size={20}
              className={isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}
            />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </article>
  );
}