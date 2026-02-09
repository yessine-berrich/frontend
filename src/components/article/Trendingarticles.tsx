// components/TrendingArticles.tsx
'use client';

import React, { useState } from 'react';
import { TrendingUp, Eye, Heart } from 'lucide-react';
import ArticleDetailModal from '../modals/ArticleDetailModal';


interface TrendingArticle {
  id: string;
  title: string;
  views: number;
  likes: number;
  category?: string;
  description?: string;
  content?: string;
  author?: {
    name: string;
    initials: string;
    department: string;
  };
  tags?: string[];
  publishedAt?: string;
}

interface TrendingArticlesProps {
  articles?: TrendingArticle[];
  title?: string;
  maxItems?: number;
}

const defaultArticles: TrendingArticle[] = [
  {
    id: '1',
    title: 'Nouvelles politiques RH : Télétravail et flexibilité',
    views: 2340,
    likes: 89,
    category: 'RH',
    description: 'Découvrez les nouvelles politiques de télétravail et de flexibilité horaire adoptées par notre entreprise pour améliorer le bien-être des employés.',
    content: `# Nouvelles politiques RH : Télétravail et flexibilité
    
Cette nouvelle politique vise à adapter notre entreprise aux nouvelles réalités du travail moderne. 

## Principaux changements

### 1. Télétravail hybride
- **2 jours par semaine** minimum en présentiel
- **Flexibilité totale** pour les équipes distribuées
- **Bureau réservable** pour les jours sur site

### 2. Aménagement du temps de travail
- **Horaires flexibles** entre 7h et 20h
- **Travail par objectifs** plutôt qu'horaires fixes
- **Pauses** plus longues pour le bien-être

### 3. Équipement fourni
- **Ordinateur portable** professionnel
- **Accessoires ergonomiques** à domicile
- **Abonnement** à des espaces de coworking

## Impact attendu
- Augmentation de 30% de la satisfaction des employés
- Réduction de 25% de l'absentéisme
- Amélioration de l'équilibre vie professionnelle/personnelle`,
    author: {
      name: 'Sophie Martin',
      initials: 'SM',
      department: 'Ressources Humaines'
    },
    tags: ['RH', 'Télétravail', 'Flexibilité', 'Politique'],
    publishedAt: '2024-02-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Guide complet pour démarrer avec React et TypeScript en entreprise',
    views: 1250,
    likes: 42,
    category: 'Développement',
    description: 'Un guide pratique pour intégrer TypeScript dans vos projets React en entreprise, avec les bonnes pratiques et astuces.',
    content: `# Guide complet pour démarrer avec React et TypeScript en entreprise
    
TypeScript apporte une robustesse exceptionnelle aux applications React. Voici comment l'adopter en entreprise.

## Pourquoi TypeScript ?

### Avantages
- **Détection d'erreurs** à la compilation
- **Meilleure autocomplétion** et documentation
- **Refactoring** plus sûr et plus rapide
- **Collaboration** améliorée entre développeurs

### Configuration initiale
\`\`\`bash
# Créer un projet avec TypeScript
npx create-react-app mon-projet --template typescript

# Ou avec Next.js
npx create-next-app@latest --typescript
\`\`\`

## Best Practices

### 1. Types stricts
\`\`\`typescript
// Éviter le type 'any'
interface User {
  id: number;
  name: string;
  email: string;
}

// Utiliser des génériques
const fetchData = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  return response.json();
};
\`\`\``,
    author: {
      name: 'Alexandre Dubois',
      initials: 'AD',
      department: 'Développement Frontend'
    },
    tags: ['React', 'TypeScript', 'Frontend', 'Guide'],
    publishedAt: '2024-02-10T09:30:00Z'
  },
  {
    id: '3',
    title: "Best practices pour le design system de l'entreprise",
    views: 890,
    likes: 34,
    category: 'Design',
    description: 'Découvrez les meilleures pratiques pour créer et maintenir un design system cohérent à l\'échelle de l\'entreprise.',
    content: `# Best practices pour le design system de l'entreprise
    
Un design system cohérent est crucial pour maintenir la qualité et l'identité visuelle de nos produits.

## Principes fondamentaux

### 1. Atomic Design
Notre design system suit la méthodologie Atomic Design de Brad Frost :
- **Atomes** : Boutons, icônes, inputs
- **Molécules** : Formulaires, cartes de navigation
- **Organismes** : Headers, footers, sidebars
- **Templates** : Structures de page
- **Pages** : Instances finales

### 2. Tokenisation des variables
\`\`\`css
:root {
  /* Couleurs primaires */
  --color-primary-50: #f0f9ff;
  --color-primary-500: #0ea5e9;
  --color-primary-900: #0c4a6e;
  
  /* Espacements */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  /* Typographie */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
}
\`\`\`

### 3. Accessibilité
- **Contraste** minimum de 4.5:1
- **Navigation** au clavier complète
- **ARIA labels** pour les composants complexes
- **Support des lecteurs d'écran**`,
    author: {
      name: 'Camille Leroy',
      initials: 'CL',
      department: 'Design UI/UX'
    },
    tags: ['Design System', 'UI/UX', 'Accessibilité', 'Figma'],
    publishedAt: '2024-02-05T14:15:00Z'
  },
];

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg';
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-white';
    case 3:
      return 'bg-gradient-to-br from-amber-700 to-amber-800 text-white';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export default function TrendingArticles({
  articles = defaultArticles,
  title = 'Articles tendances',
  maxItems = 5,
}: TrendingArticlesProps) {
  const [selectedArticle, setSelectedArticle] = useState<TrendingArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayedArticles = articles.slice(0, maxItems);

  const handleArticleClick = (article: TrendingArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleLike = () => {
    console.log('Article liké');
  };

  const handleBookmark = () => {
    console.log('Article bookmarké');
  };

  const handleShare = () => {
    console.log('Article partagé');
  };

  const formatArticleForModal = (article: TrendingArticle) => {
    return {
      id: article.id,
      title: article.title,
      content: article.content || article.description || 'Contenu non disponible',
      description: article.description || article.title,
      author: article.author || {
        name: 'Auteur inconnu',
        initials: 'AI',
        department: 'Non spécifié'
      },
      category: {
        name: article.category || 'Non catégorisé',
        slug: (article.category || 'non-categorise').toLowerCase().replace(/\s+/g, '-')
      },
      tags: article.tags || [],
      publishedAt: article.publishedAt || new Date().toISOString(),
      status: 'published' as const,
      stats: {
        likes: article.likes,
        comments: Math.floor(article.views / 10),
        views: article.views
      },
      isLiked: false,
      isBookmarked: false
    };
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
              <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Les plus populaires cette semaine
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
            🔥 Tendance
          </span>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {displayedArticles.map((article, index) => (
            <div
              key={article.id}
              onClick={() => handleArticleClick(article)}
              className="group p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer active:scale-[0.98] select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleArticleClick(article);
                }
              }}
            >
              <div className="flex items-start gap-3">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${getRankColor(
                      index + 1
                    )} font-bold text-sm transition-transform group-hover:scale-110`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Article Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {article.category && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        {article.category}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed">
                    {article.title}
                  </h4>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Eye className="h-3.5 w-3.5" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatNumber(article.views)}
                      </span>
                      <span>vues</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Heart className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatNumber(article.likes)}
                      </span>
                      <span>j'aime</span>
                    </div>
                  </div>
                </div>

                {/* Trending Arrow */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg
                    className="h-5 w-5 text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Mis à jour il y a 2 heures • Basé sur l'engagement des lecteurs
          </p>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          article={formatArticleForModal(selectedArticle)}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
        />
      )}
    </>
  );
}