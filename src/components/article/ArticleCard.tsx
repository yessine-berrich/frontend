'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Eye, Share2, Bookmark, MoreHorizontal, Download, Printer, FileText, User, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ArticleDetailModal from '@/components/modals/ArticleDetailModal';

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
    status: 'draft' | 'published' | 'pending';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: `${window.location.origin}/articles/${article.id}`,
      });
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const navigateToAuthorProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.author.id) {
      router.push(`/profile/${article.author.id}`);
    } else {
      router.push(`/profile/${encodeURIComponent(article.author.name)}`);
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
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
              }
              .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 20px;
              }
              .title {
                font-size: 28px;
                color: #1e40af;
                margin-bottom: 10px;
                font-weight: bold;
              }
              .meta {
                color: #6b7280;
                font-size: 14px;
                margin-bottom: 20px;
              }
              .author-info {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 10px;
              }
              .author-avatar {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
              }
              .author-name {
                font-weight: 600;
                color: #374151;
              }
              .description {
                font-size: 16px;
                color: #4b5563;
                margin-bottom: 30px;
                text-align: center;
                font-style: italic;
              }
              .category-badge {
                display: inline-block;
                background-color: #dbeafe;
                color: #1e40af;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 10px;
              }
              .content {
                font-size: 15px;
                margin-top: 30px;
                white-space: pre-wrap;
                line-height: 1.8;
              }
              .stats {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
              }
              .stat-item {
                display: flex;
                align-items: center;
                gap: 5px;
              }
              .tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 20px;
                justify-content: center;
              }
              .tag {
                color: #6b7280;
                font-size: 12px;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 11px;
                color: #9ca3af;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
              }
              .generated-date {
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="category-badge">${article.category.name}</div>
              <h1 class="title">${article.title}</h1>
              <p class="description">${article.description}</p>
              
              <div class="author-info">
                <div class="author-avatar">${article.author.initials}</div>
                <div>
                  <div class="author-name">${article.author.name}</div>
                  <div class="meta">${article.author.department} • ${getTimeAgo(article.publishedAt)}</div>
                </div>
              </div>
            </div>

            <div class="content">
              ${article.content.replace(/\n/g, '<br>')}
            </div>

            <div class="tags">
              ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join(' • ')}
            </div>

            <div class="stats">
              <div class="stat-item">👁️ ${article.stats.views} vues</div>
              <div class="stat-item">❤️ ${article.stats.likes} likes</div>
              <div class="stat-item">💬 ${article.stats.comments} commentaires</div>
            </div>

            <div class="footer">
              <div>Exporté depuis KnowledgeHub</div>
              <div class="generated-date">Généré le ${new Date().toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.onload = function() {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            setIsExporting(false);
          }, 1000);
        };
      } else {
        downloadAsHTML(htmlContent);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      setIsExporting(false);
      downloadAsText();
    }
  };

  const downloadAsHTML = (htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.title.replace(/[^a-z0-9]/gi, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  const downloadAsText = () => {
    const content = `
Titre: ${article.title}
Auteur: ${article.author.name}
Département: ${article.author.department}
Date: ${new Date(article.publishedAt).toLocaleDateString('fr-FR')}
Catégorie: ${article.category.name}
Tags: ${article.tags.join(', ')}

Description:
${article.description}

Contenu:
${article.content}

Statistiques:
- Vues: ${article.stats.views}
- Likes: ${article.stats.likes}
- Commentaires: ${article.stats.comments}

Exporté le ${new Date().toLocaleDateString('fr-FR')} depuis KnowledgeHub
    `;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

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
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10 animate-slideDown">
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
                      const printContent = `
                        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
                          <h1 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                            ${article.title}
                          </h1>
                          <div style="color: #6b7280; margin: 15px 0;">
                            <strong>Auteur:</strong> ${article.author.name}<br/>
                            <strong>Date:</strong> ${new Date(article.publishedAt).toLocaleDateString('fr-FR')}<br/>
                            <strong>Catégorie:</strong> ${article.category.name}
                          </div>
                          <div style="margin: 20px 0; color: #4b5563;">
                            ${article.content.replace(/\n/g, '<br>')}
                          </div>
                          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
                            Imprimé depuis KnowledgeHub - ${new Date().toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      `;
                      
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(printContent);
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
                      alert('Lien copié dans le presse-papier !');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Copier le lien
                  </button>
                  
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit?.(article.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      <span>Modifier</span>
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete?.(article.id);
                        setIsMenuOpen(false);
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

      {/* Article Detail Modal */}
      <ArticleDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={article}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
      />
    </>
  );
}