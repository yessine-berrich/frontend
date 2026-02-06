'use client';

import ArticleCard from '@/components/article/ArticleCard';
import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { FileText, BookOpen, Heart, MessageCircle, Eye } from 'lucide-react';
import React, { useState } from 'react';

/* =========================
   Articles de l'utilisateur (exemple)
   ========================= */
const userArticles = [
  {
    id: '1',
    title: 'Guide complet pour démarrer avec React et TypeScript en 2024',
    description:
      'Découvrez comment configurer et optimiser votre projet React avec TypeScript pour une meilleure productivité.',
    content: `Dans cet article, nous allons explorer les meilleures pratiques...`,
    author: {
      name: 'Jean Dupont',
      initials: 'JD',
      department: 'IT',
    },
    category: {
      name: 'Développement',
      slug: 'developpement',
    },
    tags: ['#React', '#TypeScript', '#Guide'],
    isFeatured: true,
    publishedAt: '2024-02-02T10:00:00Z',
    updatedAt: '2024-02-04T15:30:00Z',
    status: 'published' as const,
    stats: {
      likes: 42,
      comments: 8,
      views: 1250,
    },
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    title: 'Optimisation des performances avec Next.js 14',
    description:
      'Techniques avancées pour améliorer les performances de vos applications Next.js.',
    author: {
      name: 'Jean Dupont',
      initials: 'JD',
      department: 'IT',
    },
    category: {
      name: 'Développement',
      slug: 'developpement',
    },
    tags: ['#NextJS', '#Performance', '#Web'],
    isFeatured: false,
    publishedAt: '2024-02-01T14:20:00Z',
    status: 'published' as const,
    stats: {
      likes: 28,
      comments: 5,
      views: 890,
    },
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: '3',
    title: 'Introduction aux WebSockets en temps réel',
    description:
      'Comprendre et implémenter les communications temps réel dans vos applications web.',
    author: {
      name: 'Jean Dupont',
      initials: 'JD',
      department: 'IT',
    },
    category: {
      name: 'Développement',
      slug: 'developpement',
    },
    tags: ['#WebSockets', '#RealTime', '#NodeJS'],
    isFeatured: false,
    publishedAt: '2024-01-28T09:45:00Z',
    status: 'published' as const,
    stats: {
      likes: 15,
      comments: 3,
      views: 450,
    },
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '4',
    title: 'Les bases de Tailwind CSS pour les débutants',
    description:
      'Un guide étape par étape pour maîtriser Tailwind CSS dans vos projets.',
    author: {
      name: 'Jean Dupont',
      initials: 'JD',
      department: 'IT',
    },
    category: {
      name: 'Design',
      slug: 'design',
    },
    tags: ['#Tailwind', '#CSS', '#UI'],
    isFeatured: false,
    publishedAt: '2024-01-25T11:30:00Z',
    status: 'published' as const,
    stats: {
      likes: 37,
      comments: 7,
      views: 1200,
    },
    isLiked: true,
    isBookmarked: true,
  },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'articles' | 'drafts'>('articles');
  
  // Statistiques utilisateur
  const userStats = {
    totalArticles: userArticles.length,
    totalLikes: userArticles.reduce((sum, article) => sum + article.stats.likes, 0),
    totalComments: userArticles.reduce((sum, article) => sum + article.stats.comments, 0),
    totalViews: userArticles.reduce((sum, article) => sum + article.stats.views, 0),
    drafts: 2,
  };

  const handleLike = (id: string) => console.log('Like:', id);
  const handleBookmark = (id: string) => console.log('Bookmark:', id);
  const handleShare = (id: string) => console.log('Share:', id);
  const handleEdit = (id: string) => console.log('Edit:', id);
  const handleDelete = (id: string) => console.log('Delete:', id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ===== Colonne de gauche : Informations profil ===== */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                Profil
              </h3>
              <div className="space-y-6">
                <UserMetaCard />
                <UserInfoCard />
                <UserAddressCard />
              </div>
            </div>

            {/* ===== Statistiques utilisateur ===== */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
                Mes Statistiques
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

                {/* Brouillons */}
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {userStats.drafts}
                      </h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Brouillons
                      </span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                      <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
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

                {/* Commentaires */}
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {userStats.totalComments}
                      </h4>
                      <span className="text-sm text-green-600 dark:text-green-300">
                        Commentaires
                      </span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                      <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vue d'ensemble */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total des vues
                  </span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    {userStats.totalViews.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <Eye size={16} />
                  <span>{Math.round(userStats.totalViews / userStats.totalArticles)} vues par article en moyenne</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Colonne de droite : Mes articles ===== */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              
              {/* En-tête avec onglets */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                      Mes Articles
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Gérez et suivez les performances de vos publications
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Nouvel article
                    </button>
                  </div>
                </div>

                {/* Onglets */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setActiveTab('articles')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'articles'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    Publiés ({userArticles.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('drafts')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === 'drafts'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    Brouillons ({userStats.drafts})
                  </button>
                </div>
              </div>

              {/* Liste des articles */}
              <div className="space-y-6">
                {activeTab === 'articles' ? (
                  <>
                    {userArticles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onLike={handleLike}
                        onBookmark={handleBookmark}
                        onShare={handleShare}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showActions
                        showStatus
                        showEditOptions
                      />
                    ))}

                    {/* Pagination/Charger plus */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                      <button className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                        Voir tous mes articles ({userArticles.length})
                      </button>
                    </div>
                  </>
                ) : (
                  // Section Brouillons
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-gray-400 dark:text-gray-500" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Aucun brouillon
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Commencez à rédiger un nouvel article
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Créer un article
                    </button>
                  </div>
                )}
              </div>

              {/* Résumé des performances */}
              {activeTab === 'articles' && (
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
                    Résumé des performances
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Engagement moyen</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {Math.round((userStats.totalLikes + userStats.totalComments) / userStats.totalArticles)}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Vues par article</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {Math.round(userStats.totalViews / userStats.totalArticles)}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Taux de likes</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {Math.round((userStats.totalLikes / userStats.totalViews) * 100)}%
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Taux de commentaires</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {Math.round((userStats.totalComments / userStats.totalViews) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}