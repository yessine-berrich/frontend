'use client';

import ArticleCard from "@/components/article/ArticleCard";


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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Articles récents
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez les derniers articles publiés par vos collègues
          </p>
        </div>

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
        <div className="mt-8 text-center">
          <button className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
            Charger plus d'articles
          </button>
        </div>
      </div>
    </div>
  );
}