'use client';

import TrendingArticles from "@/components/article/Trendingarticles";
import ArticleCard from "@/components/article/ArticleCard";
import TopContributors from "@/components/users/Topcontributors";

import { FileText, Eye } from 'lucide-react';

// Exemple de données
const sampleArticles = [
  {
    id: '1',
    title: 'Guide complet pour démarrer avec React et TypeScript en 2024',
    description: 'Découvrez comment configurer et optimiser votre projet React avec TypeScript pour une meilleure productivité.',
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
    title: 'Nouvelles politiques RH : Télétravail et flexibilité',
    description: 'Découvrez les nouvelles modalités de télétravail et les options de flexibilité disponibles pour tous les employés.',
    author: {
      name: 'Sophie Laurent',
      initials: 'SL',
      department: 'RH',
    },
    category: {
      name: 'RH',
      slug: 'rh',
    },
    tags: ['#RH', '#Télétravail', '#Politique'],
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
    title: 'Best practices pour le design system de l\'entreprise',
    description: 'Un guide complet pour utiliser efficacement notre design system et maintenir la cohérence visuelle.',
    author: {
      name: 'Marie Martin',
      initials: 'MM',
      department: 'Design',
    },
    category: {
      name: 'Design',
      slug: 'design',
    },
    tags: ['#Design', '#UI', '#Best Practices'],
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
  const handleLike = (id: string) => {
    console.log('Article liked:', id);
    // TODO: Implement API call to like article
  };

  const handleBookmark = (id: string) => {
    console.log('Article bookmarked:', id);
    // TODO: Implement API call to bookmark article
  };

  const handleShare = (id: string) => {
    console.log('Article shared:', id);
    // TODO: Implement share functionality
  };

  const handleEdit = (id: string) => {
    console.log('Edit article:', id);
    // TODO: Navigate to edit page
  };

  const handleDelete = (id: string) => {
    console.log('Delete article:', id);
    // TODO: Show confirmation dialog and delete
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Articles Grid */}
            <div className="space-y-6">
              {sampleArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showActions={true}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <button className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                Charger plus d'articles
              </button>
            </div>
          </div>

          {/* Sidebar - Right Side (1 column) */}
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4">
              {/* Articles Count */}
              <div className="rounded-sm border border-stroke bg-white px-7 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                      156
                    </h4>
                    <span className="text-sm font-medium text-bodydark">Articles</span>
                  </div>
                  <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>

             
            </div>

            {/* Trending Articles */}
            <TrendingArticles />

            {/* Top Contributors */}
            <TopContributors />
          </div>
        </div>
      </div>
    </div>
  );
}