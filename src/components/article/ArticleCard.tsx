'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Share2, Bookmark, MoreHorizontal, Download, Printer, FileText, User, Edit, Trash2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ArticleDetailModal from '@/components/modals/ArticleDetailModal';
import CreateArticleModal from '@/components/modals/CreateArticleModal';
import ArticleHistoryModal from '../modals/ArticleHistoryModal';

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    description: string;
    content: string;
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
    status: 'draft' | 'published' | 'pending' | 'archived';
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
  onArticleUpdated?: () => void; // ← callback après mise à jour
  currentUserId?: number | string | null; 
  showActions?: boolean;
}

export default function ArticleCard({ 
  article, 
  onLike, 
  onBookmark, 
  onShare,
  onEdit,
  onDelete,
  onArticleUpdated,
  showActions = true ,
  currentUserId // ← AJOUTER CE PARAMÈTRE
}: ArticleCardProps) {
  // États
  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(article.stats.likes);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  // Synchronisation avec les props
  useEffect(() => {
    setIsLiked(article.isLiked || false);
    setIsBookmarked(article.isBookmarked || false);
    setLikesCount(article.stats.likes);
  }, [article.isLiked, article.isBookmarked, article.stats.likes]);

  // Gestion du clic en dehors du menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers

const handleOpenHistory = () => {
  setIsMenuOpen(false);
  setIsHistoryModalOpen(true);
};

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    onLike?.(article.id);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(article.id);
  };

  const handleShare = () => {
    onShare?.(article.id);
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: `${window.location.origin}/articles/${article.id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/articles/${article.id}`);
      alert('Lien copié !');
    }
  };

  const handleEditClick = () => {
    setIsMenuOpen(false);
    setIsEditModalOpen(true);
    onEdit?.(article.id);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    onArticleUpdated?.();
  };


  const handleOpenModal = () => setIsModalOpen(true);

const navigateToAuthorProfile = (e: React.MouseEvent) => {
  e.stopPropagation();
  
  // Essayer d'abord de récupérer du localStorage
  let currentUserId = localStorage.getItem('userId');
  const authorId = article.author.id?.toString();
  
  // Si pas d'userId dans localStorage, essayer de l'extraire du token
  if (!currentUserId) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        currentUserId = decoded.sub || decoded.id || decoded.userId;
        
        if (currentUserId) {
          // Stocker pour la prochaine fois
          localStorage.setItem('userId', currentUserId.toString());
        }
      } catch (error) {
        console.error('❌ Erreur décodage token:', error);
      }
    }
  }
  
  console.log('🔍 Navigation vers profil:', {
    currentUserId,
    authorId,
    isCurrentUser: currentUserId && authorId && currentUserId.toString() === authorId
  });
  
  if (currentUserId && authorId && currentUserId.toString() === authorId) {
    router.push('/profile');
  } else {
    if (article.author.id) {
      router.push(`/profile/${article.author.id}`);
    } else {
      router.push(`/profile/${encodeURIComponent(article.author.name)}`);
    }
  }
};


  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) return `il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
    if (diffInDays > 0) return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    if (diffInHours > 0) return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    return 'il y a quelques minutes';
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

  const exportToPDF = () => {
    setIsExporting(true);
    setIsMenuOpen(false);
    
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${article.title}</title>
            <style>
              body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
              .title { font-size: 28px; color: #1e40af; font-weight: bold; }
              .meta { color: #6b7280; font-size: 14px; }
              .content { font-size: 15px; margin-top: 30px; white-space: pre-wrap; line-height: 1.8; }
              .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            </style>
          </head>
          <body>
            <h1 class="title">${article.title}</h1>
            <p class="meta">${article.author.name} · ${article.author.department} · ${getTimeAgo(article.publishedAt)}</p>
            <div class="content">${article.content.replace(/\n/g, '<br>')}</div>
            <div class="footer">Exporté depuis KnowledgeHub · ${new Date().toLocaleDateString('fr-FR')}</div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            setIsExporting(false);
          }, 1000);
        };
      } else {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.title.replace(/[^a-z0-9]/gi, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
      }
    } catch {
      setIsExporting(false);
    }
  };

  const getProfileImageUrl = (userData: any) => {
    if (userData?.avatar) {
      return `http://localhost:3000/api/users/profile-image/${userData.id}?t=${Date.now()}`;
    }
  };

  return (
    <>
      <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-200 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar cliquable */}
            <button
              onClick={navigateToAuthorProfile}
              className="relative group/avatar"
              aria-label={`Voir le profil de ${article.author.name}`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0 overflow-hidden transition-transform group-hover/avatar:scale-105">
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
              <div className="absolute inset-0 bg-blue-600/0 group-hover/avatar:bg-blue-600/20 rounded-full transition-colors"></div>
            </button>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={navigateToAuthorProfile}
                  className="group/name flex items-center gap-1.5"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover/name:text-blue-600 dark:group-hover/name:text-blue-400 transition-colors">
                    {article.author.name}
                  </h3>
                  <User size={14} className="text-gray-400 group-hover/name:text-blue-500 transition-colors" />
                </button>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {article.author.department}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{getTimeAgo(article.publishedAt)}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
              </div>
            </div>
          </div>

          {/* More Menu */}
          {showActions && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="More options"
                disabled={isExporting}
              >
                {isExporting ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MoreHorizontal size={20} />
                )}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10">
                  <button
                    onClick={exportToPDF}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Export en cours...</span>
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        <span>Exporter en PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
                            <h1 style="color: #1e40af;">${article.title}</h1>
                            <div style="color: #6b7280; margin: 15px 0;">
                              <strong>Auteur:</strong> ${article.author.name}<br/>
                              <strong>Date:</strong> ${new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                            </div>
                            <div style="margin: 20px 0; color: #4b5563;">
                              ${article.content.replace(/\n/g, '<br>')}
                            </div>
                          </div>
                        `);
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                          setTimeout(() => printWindow.close(), 500);
                        }, 500);
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Printer size={16} />
                    <span>Imprimer</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/articles/${article.id}`);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Copier le lien
                  </button>
                  
                  {/* Bouton Modifier - ouvre le modal */}
                  {onEdit && (
                    <button
                      onClick={handleEditClick}
                      className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      <span>Modifier</span>
                    </button>
                  )}
                  <button
                      onClick={handleOpenHistory}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <Clock size={16} />
                      <span>Historique des versions</span>
                  </button>
                  
                  {/* Bouton Supprimer */}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                          onDelete(article.id);
                          setIsMenuOpen(false);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      <span>Supprimer</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category & Featured Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
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
        </div>

        {/* Title & Description - Clickable */}
        <div onClick={handleOpenModal} className="block mb-3 cursor-pointer group/link">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors line-clamp-2">
            {article.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {tag}
            </span>
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
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{article.stats.comments}</span>
            </button>

            {/* Views */}
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Eye size={20} />
              <span className="text-sm font-medium">{article.stats.views}</span>
            </div>

            {/* Bouton Export rapide */}
            <button
              onClick={exportToPDF}
              className="hidden sm:flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Exporter en PDF"
              disabled={isExporting}
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download size={20} />
              )}
            </button>
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
      </article>

      {/* Modal de lecture */}
      <ArticleDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={article}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
      />

      {/* Modal d'édition */}
      <CreateArticleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        articleId={article.id}
      />
      // Après les autres modaux, ajoutez :
      <ArticleHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        articleId={article.id}
        articleTitle={article.title}
      />
    </>
  );
}