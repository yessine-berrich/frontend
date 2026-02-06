'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ArticleCard from '@/components/article/ArticleCard';
import { FileText, BookOpen, Heart, MessageCircle, Eye, Calendar, MapPin, Mail, Globe, Users, Award, Star, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Données statiques d'exemple pour les utilisateurs
const STATIC_USERS = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@company.com',
    bio: 'Développeur full-stack passionné par React, Next.js et les bonnes pratiques de code. J\'aime partager mes connaissances avec la communauté.',
    role: 'Administrateur',
    department: 'IT - Développement',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    location: 'Paris, France',
    website: 'https://github.com/jeandupont',
    joinDate: '2023-01-15',
    badges: ['Top Contributor', 'Early Adopter', 'Mentor'],
    expertise: ['React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS']
  },
  {
    id: '2',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@company.com',
    bio: 'Designer UI/UX avec 5 ans d\'expérience. Passionnée par la création d\'interfaces intuitives et accessibles.',
    role: 'Designer',
    department: 'Design',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    location: 'Lyon, France',
    website: 'https://dribbble.com/sophiemartin',
    joinDate: '2023-03-22',
    badges: ['Design Expert', 'Community Leader'],
    expertise: ['UI Design', 'UX Research', 'Figma', 'Prototyping']
  },
  {
    id: '3',
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
  },
  // Ajout d'utilisateurs avec des IDs plus réalistes
  {
    id: '507f1f77bcf86cd799439011',
    firstName: 'Alice',
    lastName: 'Durand',
    email: 'alice.durand@company.com',
    bio: 'Data Scientist spécialisée en machine learning et analyse de données.',
    role: 'Data Scientist',
    department: 'IT - Data',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    location: 'Toulouse, France',
    website: 'https://github.com/alicedurand',
    joinDate: '2023-04-10',
    badges: ['Data Expert', 'AI Specialist'],
    expertise: ['Python', 'Machine Learning', 'Data Analysis', 'SQL']
  },
  {
    id: '507f1f77bcf86cd799439012',
    firstName: 'Thomas',
    lastName: 'Moreau',
    email: 'thomas.moreau@company.com',
    bio: 'DevOps Engineer avec une expertise en cloud et automatisation.',
    role: 'DevOps Engineer',
    department: 'IT - Infrastructure',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    location: 'Lille, France',
    website: 'https://github.com/thomasmoreau',
    joinDate: '2023-05-15',
    badges: ['Cloud Expert', 'Automation Guru'],
    expertise: ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
  }
];

// Articles statiques d'exemple - avec des IDs d'auteur correspondants
const STATIC_ARTICLES = [
  {
    id: '1',
    title: 'Guide complet pour démarrer avec React et TypeScript en 2024',
    description: 'Découvrez comment configurer et optimiser votre projet React avec TypeScript pour une meilleure productivité.',
    content: 'Dans cet article, nous allons explorer les meilleures pratiques pour créer une application React avec TypeScript...',
    authorId: '1', // Correspond à Jean Dupont
    authorName: 'Jean Dupont',
    category: { name: 'Développement', slug: 'developpement' },
    tags: ['#React', '#TypeScript', '#Guide'],
    isFeatured: true,
    publishedAt: '2024-02-02T10:00:00Z',
    updatedAt: '2024-02-04T15:30:00Z',
    status: 'published',
    stats: { likes: 42, comments: 8, views: 1250 },
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    title: 'Les bases de Tailwind CSS pour les débutants',
    description: 'Un guide étape par étape pour maîtriser Tailwind CSS dans vos projets.',
    content: 'Tailwind CSS est un framework CSS utility-first qui permet de créer des designs rapidement...',
    authorId: '1', // Correspond à Jean Dupont
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
    authorId: '3', // Correspond à Pierre Bernard
    authorName: 'Pierre Bernard',
    category: { name: 'RH', slug: 'rh' },
    tags: ['#RH', '#Télétravail'],
    isFeatured: false,
    publishedAt: '2024-02-03T14:30:00Z',
    status: 'published',
    stats: { likes: 89, comments: 12, views: 2540 },
    isLiked: true,
    isBookmarked: true
  },
  {
    id: '4',
    title: 'Introduction au Machine Learning pour les développeurs',
    description: 'Comprenez les concepts fondamentaux du machine learning et comment les appliquer.',
    authorId: '507f1f77bcf86cd799439011', // Correspond à Alice Durand
    authorName: 'Alice Durand',
    category: { name: 'Data Science', slug: 'data-science' },
    tags: ['#MachineLearning', '#AI', '#Python'],
    isFeatured: true,
    publishedAt: '2024-02-10T09:15:00Z',
    status: 'published',
    stats: { likes: 56, comments: 15, views: 1800 },
    isLiked: false,
    isBookmarked: false
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
    // Simulation du chargement des données
    const loadData = () => {
      setLoading(true);
      console.log('🔄 Chargement du profil avec ID:', userId);
      console.log('📋 IDs disponibles:', STATIC_USERS.map(u => u.id));
      
      // Simuler un délai réseau
      setTimeout(() => {
        // Trouver l'utilisateur correspondant à l'ID
        const foundUser = STATIC_USERS.find(u => u.id === userId);
        
        console.log('🔍 Utilisateur trouvé:', foundUser);
        
        if (foundUser) {
          setUser(foundUser);
          
          // Trouver les articles de cet utilisateur
          const articles = STATIC_ARTICLES.filter(article => article.authorId === userId);
          console.log('📰 Articles trouvés:', articles.length);
          setUserArticles(articles);
          
          setDebugInfo(`ID: ${userId} - Utilisateur: ${foundUser.firstName} ${foundUser.lastName} - Articles: ${articles.length}`);
        } else {
          setDebugInfo(`ID: ${userId} - Utilisateur non trouvé dans la liste`);
        }
        
        setLoading(false);
      }, 300); // Délai simulé réduit
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

  // Formatage de la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour générer un ID aléatoire pour les tests
  const generateTestId = () => {
    const testIds = ['1', '2', '3', '507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
    return testIds[Math.floor(Math.random() * testIds.length)];
  };

  // Affichage du chargement
  if (loading) {
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
          
          {/* Debug info */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              ID reçu: <code className="font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">{userId}</code>
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
              Chargement en cours...
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Squelette de la colonne gauche */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-5"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            {/* Squelette de la colonne droite */}
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
          
          {/* Debug info */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Informations de débogage</h3>
            <div className="space-y-2">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <span className="font-medium">ID reçu dans l'URL:</span>{' '}
                <code className="font-mono bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">{userId}</code>
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <span className="font-medium">IDs disponibles:</span>{' '}
                {STATIC_USERS.map(u => u.id).join(', ')}
              </p>
            </div>
          </div>

          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Utilisateur non trouvé
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              L'utilisateur avec l'ID <code className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{userId}</code> n'existe pas.
            </p>
            
            {/* Suggestions de profils de test */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                Profils de test disponibles
              </h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {STATIC_USERS.slice(0, 3).map((testUser) => (
                  <button
                    key={testUser.id}
                    onClick={() => router.push(`/profile/${testUser.id}`)}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                  >
                    {testUser.firstName}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => router.push(`/profile/${generateTestId()}`)}
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

        {/* Debug info (cachée en production) */}
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-400">
            {debugInfo}
          </p>
        </div>

        {/* En-tête du profil public */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl border-4 border-white dark:border-gray-800 overflow-hidden">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')
                  )}
                </div>
              </div>
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.firstName} {user?.lastName}
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                {user?.role} • {user?.department}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {user?.role && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-full">
                    {user.role}
                  </span>
                )}
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full">
                  {userStats.totalArticles} article{userStats.totalArticles !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Stats rapides */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Heart size={16} />
                  <span>{userStats.totalLikes} likes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MessageCircle size={16} />
                  <span>{userStats.totalComments} commentaires</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Eye size={16} />
                  <span>{userStats.totalViews.toLocaleString()} vues</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {user?.email && (
                  <a
                    href={`mailto:${user.email}`}
                    className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                    title="Envoyer un email"
                  >
                    <Mail size={16} />
                    <span className="text-sm">Contacter</span>
                  </a>
                )}
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Suivre
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ===== Colonne de gauche : Informations profil ===== */}
          <div className="space-y-6">
            {/* À propos */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                À propos
              </h3>
              <div className="space-y-4">
                {user?.bio ? (
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {user.bio}
                  </p>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic">
                    Aucune biographie disponible
                  </p>
                )}

                {/* Informations détaillées */}
                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {user?.location && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {user.location}
                      </span>
                    </div>
                  )}
                  
                  {user?.joinDate && (
                    <div className="flex items-center gap-3">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        Membre depuis {formatDate(user.joinDate)}
                      </span>
                    </div>
                  )}

                  {user?.website && (
                    <div className="flex items-center gap-3">
                      <Globe size={16} className="text-gray-400" />
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        {user.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ===== Statistiques utilisateur ===== */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                Statistiques
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Articles publiés */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                        {userStats.totalArticles}
                      </h4>
                      <span className="text-sm text-blue-600 dark:text-blue-300">
                        Articles
                      </span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Engagement */}
                <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                        {userStats.totalArticles > 0 
                          ? Math.round((userStats.totalLikes + userStats.totalComments) / userStats.totalArticles)
                          : 0}
                      </h4>
                      <span className="text-sm text-purple-600 dark:text-purple-300">
                        Engagement
                      </span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-800">
                      <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Likes reçus */}
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {userStats.totalLikes}
                      </h4>
                      <span className="text-sm text-red-600 dark:text-red-300">
                        J'aime
                      </span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-800">
                      <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Popularité */}
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                        {userStats.totalArticles > 0 
                          ? Math.round(userStats.totalViews / userStats.totalArticles)
                          : 0}
                      </h4>
                      <span className="text-sm text-yellow-600 dark:text-yellow-300">
                        Vues/article
                      </span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-800">
                      <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            {user?.badges && user.badges.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                  Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map((badge: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
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