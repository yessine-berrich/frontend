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
  avatar?: string | null; // Pour supporter les deux noms de champ
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les articles
interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  authorId: number;
  authorName: string;
  category: { name: string; slug: string };
  tags: string[];
  publishedAt: string;
  status: string;
  stats: { likes: number; comments: number; views: number };
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'articles' | 'about'>('articles');
  const [user, setUser] = useState<User | null>(null);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Fonction pour obtenir l'URL de l'image de profil
  const getProfileImageUrl = (userData: User) => {
    // Vérifier si l'utilisateur a une image de profil
    if (userData?.avatar || userData?.profileImage) {
      // On ajoute un timestamp pour forcer le navigateur à ignorer le cache après un update
      return `http://localhost:3000/api/users/profile-image/${userData.id}?t=${imageTimestamp}`;
    }
    // Retourner l'image par défaut si pas d'image
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
        
        // Uniformiser les données utilisateur
        const normalizedUser = {
          ...userData,
          avatar: userData.avatar || userData.profileImage // Support des deux champs
        };
        
        setUser(normalizedUser);
        
        // Récupérer les articles de l'utilisateur
        const articlesResponse = await fetch(`${API_URL}/api/articles?authorId=${userId}&status=published`);
        
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          setUserArticles(articlesData);
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
  }, [userId, API_URL]);

  // Rafraîchir l'image si nécessaire (par exemple après un update)
  const refreshProfileImage = () => {
    setImageTimestamp(Date.now());
  };

  // Calcul des statistiques
  const userStats = {
    totalArticles: userArticles.length,
    totalLikes: userArticles.reduce((sum, article) => sum + (article.stats?.likes || 0), 0),
    totalComments: userArticles.reduce((sum, article) => sum + (article.stats?.comments || 0), 0),
    totalViews: userArticles.reduce((sum, article) => sum + (article.stats?.views || 0), 0),
  };

  const handleLike = (id: string) => console.log('Like:', id);
  const handleBookmark = (id: string) => console.log('Bookmark:', id);
  const handleShare = (id: string) => console.log('Share:', id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

    const transformArticleForCard = (article: Article) => {
    // Compter les commentaires (vous devrez récupérer cela de votre API)
    const getCommentsCount = async (articleId: number) => {
      try {
        const response = await fetch(`/api/comments/article/${articleId}/stats`);
        if (response.ok) {
          const data = await response.json();
          return data.total || 0;
        }
      } catch (err) {
        console.error('Erreur lors du chargement des commentaires:', err);
      }
      return 0;
    };

    return {
      id: article.id.toString(),
      title: article.title,
      description: article.content.substring(0, 150) + '...',
      content: article.content,
      author: {
        id: article.author.id,
        name: `${article.author.firstName} ${article.author.lastName}`,
        initials: `${article.author.firstName.charAt(0)}${article.author.lastName.charAt(0)}`,
        department: article.author.role,
        avatar: article.author.profileImage || undefined,
      },
      category: {
        name: article.category.name,
        slug: article.category.name.toLowerCase().replace(/\s+/g, '-'),
      },
      tags: article.tags.map(tag => tag.name),
      isFeatured: false,
      publishedAt: article.createdAt,
      updatedAt: article.updatedAt,
      status: article.status as 'draft' | 'published' | 'pending',
      stats: {
        likes: 0, // À récupérer de l'API
        comments: 0, // À récupérer de l'API
        views: article.viewsCount,
      },
      isLiked: false,
      isBookmarked: false,
    };
  };

  // Formater l'utilisateur pour UserProfileHeader
  const formatUserForHeader = (user: User) => {
    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: getProfileImageUrl(user), // Utilisation de la fonction pour l'image
      role: user.role,
      department: user.role,
      email: user.email,
    };
  };

  // Formater l'utilisateur pour UserAboutCard
const formatUserForAbout = (user: User) => {
  const location = [user.city, user.state, user.country]
    .filter(Boolean)
    .join(', ') || 'Localisation non spécifiée';

  // Extraire le nom d'utilisateur des URLs si nécessaire
  const extractUsername = (url: string | null) => {
    if (!url) return null;
    // Si c'est déjà une URL complète, on la garde
    if (url.startsWith('http')) return url;
    // Sinon c'est probablement juste le nom d'utilisateur
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
    website: user.website || null, // Si vous avez ce champ
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

  // Affichage du chargement
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
          
          {/* Skeleton loader pour le header */}
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-5"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si erreur ou utilisateur non trouvé
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
                          article={transformArticleForCard(article)}
                          // article={{
                          //   ...article,
                          //   author: {
                          //     id: user.id.toString(),
                          //     name: `${user.firstName} ${user.lastName}`,
                          //     initials: (user.firstName?.[0] || '') + (user.lastName?.[0] || ''),
                          //     department: user.role || '',
                          //     avatar: getProfileImageUrl(user), // Même URL d'image pour l'auteur
                          //   },
                          // }}
                          onLike={handleLike}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          showActions={false}
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