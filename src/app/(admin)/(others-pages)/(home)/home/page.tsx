'use client';

import { useState, useEffect } from 'react';
import ArticleCard from '@/components/article/ArticleCard';
import TrendingArticles from '@/components/article/Trendingarticles';
import TopContributors from '@/components/users/Topcontributors';
import { FileText, Loader2 } from 'lucide-react';

// ✅ Plus besoin de ces interfaces complexes
// Le backend renvoie déjà les données au bon format

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>();
  const [userToken, setUserToken] = useState<string | undefined>();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('auth_token');
    
    if (userId) setCurrentUserId(parseInt(userId));
    if (token) setUserToken(token);
    
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/articles');
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // ✅ Le backend renvoie maintenant les données au bon format !
      console.log('Articles reçus:', data);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/articles/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        // Mettre à jour localement
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
      console.error('Erreur lors du like:', err);
    }
  };

  const handleBookmark = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/articles/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setArticles(prev => prev.map(article => {
          if (article.id.toString() === id) {
            return { 
              ...article, 
              isBookmarked: result.article.isBookmarked,
              bookmarksCount: result.article.bookmarksCount
            };
          }
          return article;
        }));
      }
    } catch (err) {
      console.error('Erreur lors du bookmark:', err);
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
    console.log('Edit:', id);
    window.location.href = `/articles/edit/${id}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
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
      console.error('Erreur:', err);
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  // ✅ SUPPRIMER COMPLÈTEMENT la fonction transformArticleForCard
  // Elle n'est plus nécessaire !

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ===== Main Content ===== */}
          <div className="lg:col-span-2 space-y-6">
            {articles.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun article disponible
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Soyez le premier à partager votre savoir !
                </p>
                {currentUserId && (
                  <button
                    onClick={() => window.location.href = '/articles/create'}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer un article
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ✅ Utiliser directement les articles du backend */}
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onShare={handleShare}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showActions
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