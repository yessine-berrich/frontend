'use client';

import ArticleCard from '@/components/article/ArticleCard';
import TrendingArticles from '@/components/article/Trendingarticles';
import TopContributors from '@/components/users/Topcontributors';
import { FileText } from 'lucide-react';

/* =========================
   Article complet (exemple)
   ========================= */
const featuredArticle = {
  id: '1',
  title: 'Guide complet pour démarrer avec React et TypeScript en 2024',
  description:
    'Découvrez comment configurer et optimiser votre projet React avec TypeScript pour une meilleure productivité.',
  content: `Dans cet article, nous allons explorer les meilleures pratiques pour créer une application React avec TypeScript...

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Section importante

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Points clés :
- Configuration du projet
- Typage avancé
- Bonnes pratiques`,
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
};

/* =========================
   Liste des articles
   ========================= */
const articles = [
  featuredArticle,
  {
    id: '2',
    title: 'Nouvelles politiques RH : Télétravail et flexibilité',
    description:
      'Découvrez les nouvelles modalités de télétravail et les options de flexibilité disponibles.',
    author: {
      name: 'Sophie Laurent',
      initials: 'SL',
      department: 'RH',
    },
    category: {
      name: 'RH',
      slug: 'rh',
    },
    tags: ['#RH', '#Télétravail'],
    isFeatured: false,
    publishedAt: '2024-02-03T14:30:00Z',
    status: 'published' as const,
    stats: {
      likes: 89,
      comments: 12,
      views: 2540,
    },
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: '3',
    title: 'Best practices pour le design system',
    description:
      'Un guide complet pour utiliser efficacement le design system.',
    author: {
      name: 'Marie Martin',
      initials: 'MM',
      department: 'Design',
    },
    category: {
      name: 'Design',
      slug: 'design',
    },
    tags: ['#Design', '#UI'],
    isFeatured: false,
    publishedAt: '2024-02-01T09:15:00Z',
    status: 'published' as const,
    stats: {
      likes: 67,
      comments: 15,
      views: 890,
    },
    isLiked: false,
    isBookmarked: false,
  },
];

export default function ArticlesPage() {
  const handleLike = (id: string) => console.log('Like:', id);
  const handleBookmark = (id: string) => console.log('Bookmark:', id);
  const handleShare = (id: string) => console.log('Share:', id);
  const handleEdit = (id: string) => console.log('Edit:', id);
  const handleDelete = (id: string) => console.log('Delete:', id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ===== Main Content ===== */}
          <div className="lg:col-span-2 space-y-6">

            {/* Featured article */}
            <ArticleCard
              article={featuredArticle}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions
            />

            {/* Other articles */}
            {articles.slice(1).map((article) => (
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

            <div className="text-center">
              <button className="px-6 py-3 bg-white dark:bg-gray-900 border rounded-lg">
                Charger plus d'articles
              </button>
            </div>
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
