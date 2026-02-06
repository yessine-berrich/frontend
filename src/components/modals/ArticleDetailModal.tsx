'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Heart, MessageCircle, Eye, Share2, Bookmark, Send, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
  id: string;
  author: {
    name: string;
    initials: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  createdAt: string;
  isLiked?: boolean;
}

interface Article {
  id: string;
  title: string;
  content: string;
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
  updatedAt?: string;
  status: 'draft' | 'published';
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
  const [newComment, setNewComment] = useState('');
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Mock comments data
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: { name: 'Marie Martin', initials: 'MM' },
      content: 'Excellent article ! Très utile pour les débutants. Je vais appliquer ces conseils dans mon prochain projet.',
      likes: 5,
      createdAt: '2024-02-03T10:30:00Z',
      isLiked: false,
    },
    {
      id: '2',
      author: { name: 'Pierre Bernard', initials: 'PB' },
      content: 'Merci pour ce guide détaillé ! La section sur les bonnes pratiques est particulièrement utile.',
      likes: 3,
      createdAt: '2024-02-03T14:20:00Z',
      isLiked: false,
    },
    {
      id: '3',
      author: { name: 'Sophie Laurent', initials: 'SL' },
      content: 'Très bon article, j\'ai appris plusieurs choses. Est-ce que vous prévoyez une suite sur les sujets avancés ?',
      likes: 8,
      createdAt: '2024-02-04T09:15:00Z',
      isLiked: true,
    },
  ]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus comment input when clicking on comment button
  useEffect(() => {
    if (!commentsCollapsed && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [commentsCollapsed]);

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

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: { name: 'Vous', initials: 'VO' },
      content: newComment.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
    };
    
    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
    
    // Scroll to show the new comment
    setTimeout(() => {
      if (commentsSectionRef.current) {
        const firstComment = commentsSectionRef.current.querySelector('.comment-item');
        firstComment?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const newLikes = comment.isLiked ? comment.likes - 1 : comment.likes + 1;
        return { ...comment, likes: newLikes, isLiked: !comment.isLiked };
      }
      return comment;
    }));
  };

  const toggleComments = () => {
    setCommentsCollapsed(!commentsCollapsed);
    if (!commentsCollapsed && commentsSectionRef.current) {
      setTimeout(() => {
        commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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

  if (!isOpen) return null;

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
                  src={article.author.avatar}
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

          {/* Stats Quick View */}
          <div className="flex items-center gap-4 mr-4">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
              <span className="text-sm font-medium">{likesCount}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <MessageCircle size={16} />
              <span className="text-sm font-medium">{article.stats.comments + comments.length}</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Article Content */}
          <div className="p-6 space-y-6">
            {/* Category & Featured */}
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
              {article.status === 'published' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                  </svg>
                  Validé
                </span>
              )}
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
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-200 dark:border-gray-800">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Stats & Update Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{article.stats.views} vues</span>
              </div>
              {article.updatedAt && (
                <>
                  <span>•</span>
                  <span>Mis à jour {getTimeAgo(article.updatedAt)}</span>
                </>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div 
            ref={commentsSectionRef}
            className={`border-t border-gray-200 dark:border-gray-800 transition-all duration-300 ${
              commentsCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[500px] opacity-100'
            }`}
          >
            {/* Comments Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Commentaires ({comments.length})
                </h2>
                <button
                  onClick={toggleComments}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronUp size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Add Comment */}
              <div className="mb-8">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    VO
                  </div>
                  <div className="flex-1 relative">
                    <input
                      ref={commentInputRef}
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Partagez votre avis sur cet article..."
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                        newComment.trim()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item group">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.author.initials}
                      </div>
                      <div className="flex-1">
                        <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-all ${
                          activeCommentId === comment.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {comment.author.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {getTimeAgo(comment.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              >
                                <Heart
                                  size={14}
                                  className={comment.isLiked ? 'fill-red-500 text-red-500' : ''}
                                />
                                <span>{comment.likes}</span>
                              </button>
                              <button
                                onClick={() => setActiveCommentId(activeCommentId === comment.id ? null : comment.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                        
                        {/* Reply Input (appears when comment is active) */}
                        {activeCommentId === comment.id && (
                          <div className="mt-3 ml-10">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Répondre à ce commentaire..."
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setActiveCommentId(null);
                                  }
                                }}
                              />
                              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                Répondre
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Comments */}
              {comments.length > 3 && (
                <div className="mt-8 text-center">
                  <button className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    Voir tous les commentaires ({comments.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors group/like"
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
                onClick={toggleComments}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <MessageCircle size={20} />
                <span className="text-sm font-medium">{article.stats.comments + comments.length}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                title="Partager"
              >
                <Share2 size={20} />
                <span className="text-sm font-medium hidden sm:inline">Partager</span>
              </button>
            </div>

            {/* Main Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleComments}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  commentsCollapsed
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {commentsCollapsed ? (
                  <>
                    <MessageCircle size={16} />
                    Voir les commentaires
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Réduire
                  </>
                )}
              </button>

              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-all ${
                  isBookmarked
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400'
                }`}
                title="Enregistrer"
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
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