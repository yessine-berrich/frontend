'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArticleCard from '@/components/article/ArticleCard';
import { FileText, ChevronLeft, Heart, Eye } from 'lucide-react';
import UserAboutCard from '@/components/public-profile/UserAboutCard';
import UserStatsCard from '@/components/public-profile/UserStatsCard';
import UserProfileHeader from '@/components/public-profile/UserProfileHeader';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  instagram: string | null;
  profileImage: string | null;
  avatar?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'articles' | 'about'>('articles');
  const [user, setUser] = useState<User | null>(null);
  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Récupérer l'ID utilisateur depuis le token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      return decoded.sub || decoded.id || decoded.userId || null;
    } catch {
      const userIdFromStorage = localStorage.getItem('userId');
      return userIdFromStorage ? parseInt(userIdFromStorage) : null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userIdFromToken = getUserIdFromToken();
    
    if (token && userIdFromToken) {
      setIsAuthenticated(true);
      setCurrentUserId(userIdFromToken);
    } else {
      const userIdFromStorage = localStorage.getItem('userId');
      if (userIdFromStorage) {
        setIsAuthenticated(true);
        setCurrentUserId(parseInt(userIdFromStorage));
      } else {
        setIsAuthenticated(false);
        setCurrentUserId(null);
      }
    }
  }, []);

  const getToken = () => {
    return localStorage.getItem('auth_token');
  };

  const getProfileImageUrl = (userData: User) => {
    if (userData?.avatar || userData?.profileImage) {
      return `http://localhost:3000/api/users/profile-image/${userData.id}?t=${imageTimestamp}`;
    }
    return "/images/user/owner.jpg";
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer les informations de l'utilisateur
        const userResponse = await fetch(`${API_URL}/api/users/${userId}`);
        
        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            setError('Utilisateur non trouvé');
          } else {
            throw new Error('Erreur lors du chargement du profil');
          }
          setLoading(false);
          return;
        }
        
        const userData = await userResponse.json();
        
        const normalizedUser = {
          ...userData,
          avatar: userData.avatar || userData.profileImage
        };
        
        setUser(normalizedUser);
        
        // Récupérer les articles de l'utilisateur
        const token = getToken();
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const articlesResponse = await fetch(`${API_URL}/api/articles/user/${userId}`, {
          headers
        });
        
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          
          // Transformer les articles
          const formattedArticles = articlesData.map((article: any) => {
            const authorName = article.author 
              ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() 
              : 'Utilisateur';
            
            const initials = authorName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'U';

            let tags: string[] = [];
            if (Array.isArray(article.tags)) {
              tags = article.tags.map((tag: any) => {
                if (typeof tag === 'string') return tag;
                if (tag && typeof tag === 'object' && tag.name) return tag.name;
                return String(tag);
              });
            }
            
            // Vérifier si l'utilisateur courant a liké
            let isLiked = false;
            if (currentUserId && article.likes && Array.isArray(article.likes)) {
              isLiked = article.likes.some((like: any) => 
                like.id === currentUserId || 
                like.userId === currentUserId || 
                like.user?.id === currentUserId
              );
            }
            
            // Vérifier si l'utilisateur courant a bookmarké
            let isBookmarked = false;
            if (currentUserId && article.bookmarks && Array.isArray(article.bookmarks)) {
              isBookmarked = article.bookmarks.some((bookmark: any) => 
                bookmark.id === currentUserId || 
                bookmark.userId === currentUserId || 
                bookmark.user?.id === currentUserId
              );
            }

            return {
              id: String(article.id),
              title: article.title,
              description: article.description || article.content?.substring(0, 180) + '...' || '',
              content: article.content || '',
              author: {
                id: article.author?.id,
                name: authorName,
                initials: initials,
                department: article.author?.role || 'Membre',
                avatar: article.author?.profileImage || null
              },
              category: {
                name: article.category?.name || 'Non classé',
                slug: article.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'non-classe'
              },
              tags: tags,
              publishedAt: article.publishedAt || article.createdAt,
              updatedAt: article.updatedAt,
              status: article.status || 'published',
              stats: {
                likes: article.likes?.length || article.stats?.likes || 0,
                comments: article.comments?.length || article.stats?.comments || 0,
                views: article.viewsCount || article.stats?.views || 0,
              },
              isLiked: isLiked,
              isBookmarked: isBookmarked,
              isFeatured: false,
            };
          });
          
          setUserArticles(formattedArticles);
        }
        
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les données du profil');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, API_URL, currentUserId]);

  const handleLike = async (id: string) => {
    const token = getToken();
    if (!token) {
      alert('Veuillez vous connecter pour liker un article');
      return;
    }
    
    try {
      const article = userArticles.find(a => a.id === id);
      if (!article) return;

      const newIsLiked = !article.isLiked;
      
      // Optimistic update
      setUserArticles(prev => prev.map(article => {
        if (article.id === id) {
          return {
            ...article,
            isLiked: newIsLiked,
            stats: {
              ...article.stats,
              likes: article.stats.likes + (newIsLiked ? 1 : -1)
            }
          };
        }
        return article;
      }));

      const response = await fetch(`${API_URL}/api/articles/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du like');
      }
      
    } catch (err) {
      console.error('Erreur like:', err);
      alert('Erreur lors du like');
      window.location.reload();
    }
  };

  const handleBookmark = async (id: string) => {
    const token = getToken();
    if (!token) {
      alert('Veuillez vous connecter pour sauvegarder un article');
      return;
    }
    
    try {
      const article = userArticles.find(a => a.id === id);
      if (!article) return;

      const newIsBookmarked = !article.isBookmarked;
      
      setUserArticles(prev => prev.map(article => {
        if (article.id === id) {
          return {
            ...article,
            isBookmarked: newIsBookmarked
          };
        }
        return article;
      }));

      const response = await fetch(`${API_URL}/api/articles/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du bookmark');
      }
      
    } catch (err) {
      console.error('Erreur bookmark:', err);
      alert('Erreur lors du bookmark');
      window.location.reload();
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/articles/${id}`;
    navigator.clipboard.writeText(url);
    alert('Lien copié !');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatUserForHeader = (user: User) => {
    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: getProfileImageUrl(user),
      role: user.role,
      department: user.role,
      email: user.email,
    };
  };

  const formatUserForAbout = (user: User) => {
    const location = [user.city, user.state, user.country]
      .filter(Boolean)
      .join(', ') || 'Localisation non spécifiée';

    const extractUsername = (url: string | null) => {
      if (!url) return null;
      if (url.startsWith('http')) return url;
      return url;
    };

    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio || '',
      role: user.role,
      department: user.role,
      profileImage: getProfileImageUrl(user),
      location,
      website: null,
      joinDate: user.createdAt,
      badges: [],
      expertise: [],
      socialLinks: {
        facebook: extractUsername(user.facebook),
        twitter: extractUsername(user.twitter),
        linkedin: extractUsername(user.linkedin),
        instagram: extractUsername(user.instagram)
      }
    };
  };

  // Calcul des statistiques
  const userStats = {
    totalArticles: userArticles.length,
    totalLikes: userArticles.reduce((sum, article) => sum + (article.stats?.likes || 0), 0),
    totalComments: userArticles.reduce((sum, article) => sum + (article.stats?.comments || 0), 0),
    totalViews: userArticles.reduce((sum, article) => sum + (article.stats?.views || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} />
            Retour
          </button>
          
          {/* Skeleton loader */}
          <div className="mb-8 animate-pulse">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={20} />
            Retour
          </button>
          
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">😕</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Profil non trouvé
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || "L'utilisateur que vous recherchez n'existe pas ou a été supprimé."}
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={20} />
          Retour
        </button>

        {/* En-tête du profil public */}
        <UserProfileHeader 
          user={formatUserForHeader(user)} 
          stats={userStats} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Colonne de gauche : Informations profil */}
          <div className="space-y-6">
            <UserAboutCard user={formatUserForAbout(user)} />
            <UserStatsCard stats={userStats} />
          </div>

          {/* Colonne de droite : Contenu principal */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              
              {/* Onglets */}
              <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'articles'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  Articles ({userArticles.length})
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                    activeTab === 'about'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  À propos
                </button>
              </div>

              {/* Liste des articles OU section À propos */}
              <div className="space-y-6">
                {activeTab === 'articles' ? (
                  userArticles.length > 0 ? (
                    <>
                      {userArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onLike={handleLike}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          showActions={isAuthenticated}
                        />
                      ))}
                      
                      {/* Résumé des performances */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
                          Résumé des performances
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm text-blue-600 dark:text-blue-400">Engagement moyen</div>
                            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                              {userStats.totalArticles > 0 
                                ? Math.round((userStats.totalLikes + userStats.totalComments) / userStats.totalArticles)
                                : 0}
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm text-green-600 dark:text-green-400">Vues/article</div>
                            <div className="text-lg font-bold text-green-700 dark:text-green-300">
                              {userStats.totalArticles > 0 
                                ? Math.round(userStats.totalViews / userStats.totalArticles)
                                : 0}
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-sm text-purple-600 dark:text-purple-400">Taux de likes</div>
                            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                              {userStats.totalViews > 0 
                                ? Math.round((userStats.totalLikes / userStats.totalViews) * 100)
                                : 0}%
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-sm text-orange-600 dark:text-orange-400">Taux de commentaires</div>
                            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
                              {userStats.totalViews > 0 
                                ? Math.round((userStats.totalComments / userStats.totalViews) * 100)
                                : 0}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="text-gray-400 dark:text-gray-500" size={24} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun article publié
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {user.firstName} n'a pas encore publié d'articles.
                      </p>
                    </div>
                  )
                ) : (
                  // Section À propos
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        Bio
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {user.bio || "Aucune biographie n'a été renseignée."}
                      </p>
                    </div>

                    {/* Derniers articles */}
                    {userArticles.length > 0 && (
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
                          Dernières publications
                        </h4>
                        <div className="space-y-3">
                          {userArticles.slice(0, 3).map((article) => (
                            <div
                              key={article.id}
                              className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                              onClick={() => router.push(`/articles/${article.id}`)}
                            >
                              <h5 className="font-medium text-gray-800 dark:text-white mb-2 line-clamp-1">
                                {article.title}
                              </h5>
                              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span>{formatDate(article.publishedAt)}</span>
                                <span className="flex items-center gap-2">
                                  <Heart size={12} className={article.isLiked ? 'text-red-500 fill-red-500' : ''} />
                                  <span>{article.stats?.likes || 0}</span>
                                  <Eye size={12} className="ml-2" />
                                  <span>{article.stats?.views || 0}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}