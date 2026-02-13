// /home/pfe2026/Desktop/PfeProject/frontend/src/app/(admin)/(others-pages)/(liked)/liked/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Search,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  Calendar,
  Bookmark,
  Folder,
  Tag,
  X,
  LogOut
} from 'lucide-react';

import ArticleCard from '@/components/article/ArticleCard';

// ============================================
// CONFIGURATION - CHANGEZ ICI SI BESOIN
// ============================================

// ✅ SOLUTION 1: Utiliser l'URL directe du backend (RECOMMANDÉ)
const API_URL = 'http://localhost:3000'; // Votre backend NestJS

// ❌ SOLUTION 2: Utiliser le proxy (si configuré)
// const API_URL = ''; // Laissez vide pour utiliser le proxy

// ============================================
// TYPES
// ============================================

interface LikedArticle {
  id: number;
  title: string;
  description: string;
  content: string;
  author: {
    id?: number;
    name: string;
    initials?: string;
    department?: string;
    avatar?: string | null;
  } | null;
  category: {
    id: number;
    name: string;
    slug?: string;
  } | null;
  tags: string[];
  createdAt: string;
  publishedAt?: string;
  updatedAt?: string;
  likesCount: number;
  bookmarksCount: number;
  commentsCount?: number;
  viewsCount?: number;
  status?: 'draft' | 'published' | 'pending';
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export default function LikedArticlesPage() {
  const router = useRouter();
  
  // États
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'popular'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [tags, setTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 6;

  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================

  const getToken = () => {
    return localStorage.getItem('auth_token');
  };

  const getApiUrl = (path: string) => {
    // Si API_URL est défini, utilisez l'URL complète
    if (API_URL) {
      return `${API_URL}${path}`;
    }
    // Sinon, utilisez le proxy
    return path;
  };

  // ============================================
  // FONCTIONS API
  // ============================================

  const fetchLikedArticles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      
      console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'Aucun');
      
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      // ✅ Construction de l'URL
      const url = getApiUrl('/api/articles/user/liked');
      console.log('📡 URL appelée:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status:', response.status);

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        router.push('/auth/signin');
        throw new Error('Session expirée');
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Données reçues:', data);
      
      if (data.success) {
        // Transformation des données
        const formattedArticles = data.articles.map((article: any) => {
          const authorName = article.author?.name || 'Utilisateur';
          const initials = authorName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          // Catégories
          if (article.category?.name && !categories.includes(article.category.name)) {
            setCategories(prev => [...prev, article.category.name]);
          }

          // Tags
          article.tags?.forEach((tag: string) => {
            if (tag && !tags.includes(tag)) {
              setTags(prev => [...prev, tag]);
            }
          });

          return {
            id: String(article.id),
            title: article.title,
            description: article.description || article.content?.substring(0, 180) + '...',
            content: article.content || '',
            author: {
              id: article.author?.id,
              name: authorName,
              initials: initials,
              department: article.author?.department || 'Membre',
              avatar: article.author?.avatar || null
            },
            category: {
              name: article.category?.name || 'Non classé',
              slug: article.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'non-classe'
            },
            tags: article.tags || [],
            publishedAt: article.publishedAt || article.createdAt,
            updatedAt: article.updatedAt,
            status: article.status || 'published',
            stats: {
              likes: article.likesCount || 0,
              comments: article.commentsCount || 0,
              views: article.viewsCount || 0,
            },
            isLiked: true,
            isBookmarked: article.bookmarksCount > 0,
            isFeatured: false,
          };
        });

        setArticles(formattedArticles);
        setTotalCount(data.count);
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = async (articleId: string) => {
    try {
      const token = getToken();
      if (!token) return;

      // Optimistic update
      setArticles(prev => prev.filter(a => a.id !== articleId));
      setTotalCount(prev => Math.max(0, prev - 1));

      const url = getApiUrl(`/api/articles/${articleId}/like`);
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('❌ Erreur unlike:', err);
      await fetchLikedArticles();
    }
  };

  const handleBookmark = async (articleId: string) => {
    try {
      const token = getToken();
      if (!token) return;

      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      const newBookmarkState = !article.isBookmarked;
      
      setArticles(prev => 
        prev.map(a => 
          a.id === articleId 
            ? { ...a, isBookmarked: newBookmarkState } 
            : a
        )
      );

      const url = getApiUrl(`/api/articles/${articleId}/bookmark`);
      await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('❌ Erreur bookmark:', err);
      await fetchLikedArticles();
    }
  };

  const handleShare = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const shareUrl = `${window.location.origin}/articles/${articleId}`;
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handleEdit = (articleId: string) => {
    router.push(`/articles/edit/${articleId}`);
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    try {
      const token = getToken();
      const url = getApiUrl(`/api/articles/${articleId}`);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setArticles(prev => prev.filter(a => a.id !== articleId));
        setTotalCount(prev => prev - 1);
      }
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('knowledgehub-users');
    router.push('/auth/signin');
  };

  // Chargement initial
  useEffect(() => {
    fetchLikedArticles();
  }, []);

  // ============================================
  // FILTRAGE ET TRI
  // ============================================

  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category.name === selectedCategory;
      const matchesTag = selectedTag === 'all' || article.tags.includes(selectedTag);
      
      return matchesSearch && matchesCategory && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      } else if (sortBy === 'popular') {
        return b.stats.likes - a.stats.likes;
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTag, sortBy]);

  // ============================================
  // RENDU
  // ============================================

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Chargement de vos articles aimés...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400 fill-current" />
                </span>
                Articles aimés
              </h1>
              {totalCount > 0 && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {totalCount}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {totalCount === 0 
                ? "Vous n'avez pas encore aimé d'articles"
                : `${totalCount} article${totalCount > 1 ? 's' : ''} dans votre collection`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLikedArticles()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Recherche */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par titre, auteur, catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 lg:w-auto"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </button>
        </div>

        {/* Panneau de filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-3">
                {/* Tri */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trier par
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="recent">Plus récents</option>
                    <option value="oldest">Plus anciens</option>
                    <option value="popular">Plus populaires</option>
                  </select>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Catégorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tag
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Tous les tags</option>
                    {tags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtres actifs */}
              {(selectedCategory !== 'all' || selectedTag !== 'all' || searchQuery) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Filtres actifs:
                  </span>
                  
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery('')}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      <Folder className="h-3 w-3" />
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  
                  {selectedTag !== 'all' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      <Tag className="h-3 w-3" />
                      {selectedTag}
                      <button onClick={() => setSelectedTag('all')}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedTag('all');
                    }}
                    className="text-xs font-medium text-gray-500 underline"
                  >
                    Tout effacer
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* État d'erreur */}
      {error && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            {error === 'Session expirée' ? 'Session expirée' : 'Erreur de chargement'}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {error === 'Session expirée' 
              ? 'Veuillez vous reconnecter'
              : 'Impossible de charger vos articles aimés'}
          </p>
          {error === 'Session expirée' ? (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90"
            >
              Se connecter
            </Link>
          ) : (
            <button
              onClick={fetchLikedArticles}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90"
            >
              Réessayer
            </button>
          )}
        </div>
      )}

      {/* État vide */}
      {!error && filteredArticles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
            <Heart className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Aucun article aimé
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Explorez notre base de connaissances et likez vos articles préférés !
          </p>
          <Link
            href="/articles"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90"
          >
            Explorer les articles
          </Link>
        </div>
      )}

      {/* Grille des articles */}
      {!error && filteredArticles.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {paginatedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onLike={() => handleUnlike(article.id)}
                onBookmark={() => handleBookmark(article.id)}
                onShare={() => handleShare(article.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                      currentPage === i + 1
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:text-primary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}