'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ArticleCard from '@/components/article/ArticleCard';
import { FileText, BookOpen, Heart, MessageCircle, Eye, Calendar, MapPin, Mail, Globe, Users, Award, Star, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserProfileHeader from '@/components/public-profile/UserProfileHeader';
import UserAboutCard from '@/components/public-profile/UserAboutCard';
import UserStatsCard from '@/components/public-profile/UserStatsCard';

// Données statiques d'exemple pour les utilisateurs
const STATIC_USERS = [

  {
    id: '2',
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'pierre.bernard@company.com',
    bio: 'Manager RH spécialisé dans le développement des compétences et la gestion des talents.',
    role: 'Manager RH',
    department: 'Ressources Humaines',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    location: 'Marseille, France',
    website: null,
    joinDate: '2023-02-10',
    badges: ['HR Specialist', 'Team Builder'],
    expertise: ['Recrutement', 'Formation', 'Gestion des talents']
  }
];

// Articles statiques d'exemple - avec des IDs d'auteur correspondants
const STATIC_ARTICLES = [

  {
    id: '2',
    title: 'Les bases de Tailwind CSS pour les débutants',
    description: 'Un guide étape par étape pour maîtriser Tailwind CSS dans vos projets.',
    content: 'Tailwind CSS est un framework CSS utility-first qui permet de créer des designs rapidement...',
    authorId: '2', // Correspond à Jean Dupont
    authorName: 'Jean Dupont',
    category: { name: 'Design', slug: 'design' },
    tags: ['#Tailwind', '#CSS', '#UI'],
    isFeatured: false,
    publishedAt: '2024-01-25T11:30:00Z',
    status: 'published',
    stats: { likes: 37, comments: 7, views: 1200 },
    isLiked: true,
    isBookmarked: true
  },
  {
    id: '3',
    title: 'Nouvelles politiques RH : Télétravail et flexibilité',
    description: 'Découvrez les nouvelles modalités de télétravail et les options de flexibilité disponibles.',
    authorId: '2', // Correspond à Pierre Bernard
    authorName: 'Pierre Bernard',
    category: { name: 'RH', slug: 'rh' },
    tags: ['#RH', '#Télétravail'],
    isFeatured: false,
    publishedAt: '2024-02-03T14:30:00Z',
    status: 'published',
    stats: { likes: 89, comments: 12, views: 2540 },
    isLiked: true,
    isBookmarked: true
  }
];

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<'articles' | 'about'>('articles');
  const [user, setUser] = useState<any>(null);
  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      
      setTimeout(() => {
        const foundUser = STATIC_USERS.find(u => u.id === userId);
        
        if (foundUser) {
          setUser(foundUser);
          const articles = STATIC_ARTICLES.filter(article => article.authorId === userId);
          setUserArticles(articles);
        }
        
        setLoading(false);
      }, 300);
    };

    loadData();
  }, [userId]);

  // Calcul des statistiques
  const userStats = {
    totalArticles: userArticles.length,
    totalLikes: userArticles.reduce((sum, article) => sum + article.stats.likes, 0),
    totalComments: userArticles.reduce((sum, article) => sum + article.stats.comments, 0),
    totalViews: userArticles.reduce((sum, article) => sum + article.stats.views, 0),
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

  // Affichage si utilisateur non trouvé
  if (!user) {
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
          <div className="text-center max-w-md mx-auto">
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => router.push(`/profile/2`)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Tester un profil aléatoire
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
        <UserProfileHeader user={user} stats={userStats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ===== Colonne de gauche : Informations profil ===== */}
          <div className="space-y-6">
            <UserAboutCard user={user} />
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
                  Expertise
                </button>
              </div>

              {/* Liste des articles OU section Expertise */}
              <div className="space-y-6">
                {activeTab === 'articles' ? (
                  userArticles.length > 0 ? (
                    <>
                      {userArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={{
                            ...article,
                            author: {
                              id: user.id,
                              name: `${user.firstName} ${user.lastName}`,
                              initials: (user.firstName?.[0] || '') + (user.lastName?.[0] || ''),
                              department: user.department || '',
                              avatar: user.profileImage,
                            },
                          }}
                          onLike={handleLike}
                          onBookmark={handleBookmark}
                          onShare={handleShare}
                          showActions={false}
                        />
                      ))}

                      {/* Message si peu d'articles */}
                      {userArticles.length <= 3 && (
                        <div className="text-center py-6">
                          <p className="text-gray-500 dark:text-gray-400">
                            {user.firstName} a publié {userArticles.length} article{userArticles.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
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
                  // Section Expertise
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        Compétences et expertise
                      </h3>
                      {user?.expertise && user.expertise.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {user.expertise.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic">
                          Aucune expertise spécifiée
                        </p>
                      )}
                    </div>

                    {/* Contributions récentes */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                      <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
                        Dernières contributions
                      </h4>
                      {userArticles.slice(0, 3).length > 0 ? (
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
                                  <span>{article.stats.likes}</span>
                                  <Eye size={12} className="ml-2" />
                                  <span>{article.stats.views}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic">
                          Aucune contribution récente
                        </p>
                      )}
                    </div>
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