'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArticleCard from '@/components/article/ArticleCard';
import { FileText, ChevronLeft, Heart, Eye } from 'lucide-react';
import UserAboutCard from '@/components/public-profile/UserAboutCard';
import UserStatsCard from '@/components/public-profile/UserStatsCard';
import UserProfileHeader from '@/components/public-profile/UserProfileHeader';

// Interface pour typer les données utilisateur depuis le backend
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

// Interface pour les articles (format backend)
interface Article {
  id: number;
  title: string;
  content: string;
  description?: string;
  status: string;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
    role: string;
  };
  category: {
    id: number;
    name: string;
  };
  tags?: Array<{ id: number; name: string }> | string[]; // Les tags peuvent être sous différentes formes
  likes?: any[];
  bookmarks?: any[];
  comments?: any[];
  likesCount?: number;
  commentsCount?: number;
  bookmarksCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  stats?: {
    likes: number;
    comments: number;
    views: number;
  };
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
  const [userToken, setUserToken] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setUserToken(token);
  }, []);

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
        
        // Récupérer les articles de l'utilisateur avec le token si disponible
        const headers: HeadersInit = {};
        if (userToken) {
          headers['Authorization'] = `Bearer ${userToken}`;
        }
        
        const articlesResponse = await fetch(`${API_URL}/api/articles/user/${userId}`, {
          headers
        });
        
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          console.log('📊 Articles reçus:', articlesData);
          
          // ✅ TRANSFORMER LES ARTICLES POUR CORRESPONDRE AU FORMAT ATTENDU PAR ARTICLECARD
          const formattedArticles = articlesData.map((article: any) => {
            // Extraire les infos de l'auteur
            const authorName = article.author 
              ? `${article.author.firstName || ''} ${article.author.lastName || ''}`.trim() 
              : 'Utilisateur';
            
            const initials = authorName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'U';

            // Formater les tags (peuvent être un tableau d'objets ou de strings)
            let tags: string[] = [];
            if (Array.isArray(article.tags)) {
              tags = article.tags.map((tag: any) => {
                if (typeof tag === 'string') return tag;
                if (tag && typeof tag === 'object' && tag.name) return tag.name;
                return String(tag);
              });
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
                likes: article.likesCount || article.likes?.length || 0,
                comments: article.commentsCount || article.comments?.length || 0,
                views: article.viewsCount || 0,
              },
              isLiked: article.isLiked || false,
              isBookmarked: article.isBookmarked || false,
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
  }, [userId, API_URL, userToken]);

  const refreshProfileImage = () => {
    setImageTimestamp(Date.now());
  };

  // Calcul des statistiques avec les articles formatés
  const userStats = {
    totalArticles: userArticles.length,
    totalLikes: userArticles.reduce((sum, article) => sum + (article.stats?.likes || 0), 0),
    totalComments: userArticles.reduce((sum, article) => sum + (article.stats?.comments || 0), 0),
    totalViews: userArticles.reduce((sum, article) => sum + (article.stats?.views || 0), 0),
  };

  const handleLike = async (id: string) => {
    if (!userToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/articles/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        
        setUserArticles(prev => prev.map(article => {
          if (article.id === id) {
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
      console.error('❌ Erreur like:', err);
    }
  };

  const handleBookmark = async (id: string) => {
    if (!userToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/articles/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        
        setUserArticles(prev => prev.map(article => {
          if (article.id === id) {
            return {
              ...article,
              isBookmarked: result.article.isBookmarked
            };
          }
          return article;
        }));
      }
    } catch (err) {
      console.error('❌ Erreur bookmark:', err);
    }
  };

  const handleShare = (id: string) => {
    const article = userArticles.find(a => a.id === id);
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
          
          {/* ===== Colonne de gauche : Informations profil ===== */}
          <div className="space-y-6">
            <UserAboutCard user={formatUserForAbout(user)} />
            <UserStatsCard stats={userStats} />
          </div>

          {/* ===== Colonne de droite : Contenu principal ===== */}
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
                          // ✅ UTILISER LES ARTICLES FORMATÉS
                          article={article}
                          onLike={handleLike}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          showActions={!!userToken}
                        />
                      ))}
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
                              onClick={() => router.push(`/article/${article.id}`)}
                            >
                              <h5 className="font-medium text-gray-800 dark:text-white mb-2 line-clamp-1">
                                {article.title}
                              </h5>
                              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                <span>{formatDate(article.publishedAt)}</span>
                                <span className="flex items-center gap-2">
                                  <Heart size={12} />
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