'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/article/ArticleCard';
import TrendingArticles from '@/components/article/Trendingarticles';
import TopContributors from '@/components/users/Topcontributors';
import { FileText, Loader2, Search, SlidersHorizontal, X, Folder, Tag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateArticleModal from '@/components/modals/CreateArticleModal';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [userToken, setUserToken] = useState<string | undefined>();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | undefined>();

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'popular'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tags, setTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 6;

// Dans ArticlesPage.tsx
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  let userId = localStorage.getItem('userId');
  
  // Si userId n'est pas dans localStorage, essayer de l'extraire du token
  if (!userId && token) {
    try {
      // Décoder le token JWT (partie du milieu)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      userId = decoded.sub || decoded.id || decoded.userId;
      
      if (userId) {
        // Stocker pour la prochaine fois
        localStorage.setItem('userId', userId.toString());
        console.log('✅ userId extrait du token:', userId);
      }
    } catch (error) {
      console.error('❌ Erreur décodage token:', error);
    }
  }
  
  console.log('🔐 ArticlesPage - localStorage:', { 
    userId, 
    token: token ? 'présent' : 'absent' 
  });
  
  if (userId) {
    setCurrentUserId(parseInt(userId.toString()));
  }
  
  if (token) setUserToken(token);
  
  fetchArticles();
}, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // ✅ Récupérer le token à chaque appel
      const token = localStorage.getItem('auth_token');
      
      // ✅ CONSTRUIRE LES HEADERS AVEC LE TOKEN
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token envoyé:', token.substring(0, 20) + '...');
      } else {
        console.log('🔑 Aucun token trouvé');
      }

      const response = await fetch('http://localhost:3000/api/articles', {
        headers // ✅ IMPORTANT: passer les headers
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('✅ Articles reçus avec token:', token ? 'oui' : 'non');
      
      // ✅ FILTRER POUR GARDER UNIQUEMENT LES ARTICLES PUBLIÉS
      const publishedArticles = data.filter((article: any) => article.status === 'published');
      
      console.log(`📊 ${publishedArticles.length} articles publiés sur ${data.length} total`);
      
      if (publishedArticles.length > 0) {
        console.log('📊 Premier article publié:', {
          id: publishedArticles[0].id,
          title: publishedArticles[0].title,
          status: publishedArticles[0].status,
          isLiked: publishedArticles[0].isLiked,
          isBookmarked: publishedArticles[0].isBookmarked,
          likesCount: publishedArticles[0].stats?.likes
        });
      }
      
      setArticles(publishedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('❌ Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditingArticleId(undefined);
  };

  const handleArticleSuccess = () => {
    fetchArticles();
  };

  const handleLike = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Veuillez vous connecter pour liker un article');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/articles/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Like response:', result);
        
        setArticles(prev => prev.map(article => {
          if (article.id.toString() === id) {
            return { 
              ...article, 
              isLiked: result.article.isLiked,
              stats: {
                ...article.stats,
                likes: result.article.likesCount
              }
            };
          }
          return article;
        }));
      }
    } catch (err) {
      console.error('❌ Erreur lors du like:', err);
    }
  };

  const handleBookmark = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Veuillez vous connecter pour sauvegarder un article');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/articles/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Bookmark response:', result);
        
        setArticles(prev => prev.map(article => {
          if (article.id.toString() === id) {
            return { 
              ...article, 
              isBookmarked: result.article.isBookmarked
            };
          }
          return article;
        }));
      }
    } catch (err) {
      console.error('❌ Erreur lors du bookmark:', err);
    }
  };

  const handleShare = (id: string) => {
    const article = articles.find(a => a.id.toString() === id);
    if (!article) return;
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: `${window.location.origin}/articles/${id}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/articles/${id}`);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const handleEdit = (id: string) => {
    setEditingArticleId(id);
    setCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setArticles(prev => prev.filter(article => article.id.toString() !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Erreur</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={fetchArticles}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Articles de la communauté
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez les derniers articles partagés par nos collaborateurs
          </p>
          {!userToken && (
            <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ Connectez-vous pour liker et sauvegarder des articles
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ===== Main Content ===== */}
          <div className="lg:col-span-2 space-y-6">
            {articles.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun article publié
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Soyez le premier à partager votre savoir !
                </p>
                {currentUserId && (
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer un article
                  </button>
                )}
              </div>
            ) : (
              <>
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                    showActions={!!userToken}
                  />
                ))}
              </>
            )}

            {/* Bouton Actualiser */}
            {articles.length > 0 && (
              <div className="text-center">
                <button 
                  onClick={fetchArticles}
                  className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Actualiser les articles
                </button>
              </div>
            )}
            
            <CreateArticleModal
              isOpen={isCreateModalOpen}
              onClose={handleCloseModal}
              onSuccess={handleArticleSuccess}
              articleId={editingArticleId}
            />
          </div>

          {/* ===== Sidebar ===== */}
          <div className="space-y-6">
            <TrendingArticles />
            <TopContributors />
          </div>
        </div>
      </div>
    </div>
  );
}