'use client';

import { useState, useEffect } from 'react';
import CreateCategoryModal from '@/components/modals/CreateCategoryModal';
import CategoriesManager from '@/components/categories/CategoriesManager';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  articleCount: number;
  icon: string;
}

const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Frontend',
    description: 'Technologies et frameworks côté client : React, Vue, Angular, CSS, HTML',
    color: 'bg-blue-500',
    articleCount: 45,
    icon: '🎨',
  },
  {
    id: '2',
    name: 'Backend',
    description: 'Développement serveur : Node.js, Python, Java, bases de données',
    color: 'bg-green-500',
    articleCount: 38,
    icon: '⚙️',
  },
  {
    id: '3',
    name: 'DevOps',
    description: 'Infrastructure, CI/CD, conteneurisation, orchestration',
    color: 'bg-orange-500',
    articleCount: 24,
    icon: '🚀',
  },
  {
    id: '4',
    name: 'Base de données',
    description: 'SQL, NoSQL, optimisation, modélisation de données',
    color: 'bg-purple-500',
    articleCount: 18,
    icon: '🗄️',
  },
  {
    id: '5',
    name: 'Sécurité',
    description: 'Cybersécurité, authentification, bonnes pratiques',
    color: 'bg-red-500',
    articleCount: 15,
    icon: '🔒',
  },
  {
    id: '6',
    name: 'Architecture',
    description: 'Patterns, microservices, design system, scalabilité',
    color: 'bg-indigo-500',
    articleCount: 12,
    icon: '🏗️',
  },
  {
    id: '7',
    name: 'IA & Machine Learning',
    description: 'Intelligence artificielle, apprentissage automatique, LLM',
    color: 'bg-pink-500',
    articleCount: 21,
    icon: '🤖',
  },
  {
    id: '8',
    name: 'Mobile',
    description: 'Développement iOS, Android, React Native, Flutter',
    color: 'bg-cyan-500',
    articleCount: 9,
    icon: '📱',
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Charger les catégories depuis localStorage au montage
  useEffect(() => {
    const savedCategories = localStorage.getItem('knowledgehub-categories');
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    }
  }, []);

  // Sauvegarder les catégories dans localStorage quand elles changent
  useEffect(() => {
    localStorage.setItem('knowledgehub-categories', JSON.stringify(categories));
  }, [categories]);

  const handleCreateCategory = (categoryData: {
    name: string;
    description: string;
    icon: string;
    color: string;
  }) => {
    if (editingCategory) {
      // Update existing category
      setCategories(prev =>
        prev.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, ...categoryData }
            : cat
        )
      );
      setEditingCategory(null);
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryData,
        articleCount: 0,
      };
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    const message = category.articleCount > 0
      ? `Êtes-vous sûr de vouloir supprimer "${category.name}" ? Cette catégorie contient ${category.articleCount} article(s).`
      : `Êtes-vous sûr de vouloir supprimer "${category.name}" ?`;

    if (window.confirm(message)) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  const handleViewArticles = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    console.log('Voir les articles de la catégorie:', category?.name);
    // TODO: Navigate to articles page with filter
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Catégories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organisez vos articles par thème et facilitez la navigation
          </p>
        </div>

        {/* Categories Manager */}
        <CategoriesManager
          categories={categories}
          onCreateClick={() => setIsCreateModalOpen(true)}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onViewArticles={handleViewArticles}
        />
      </div>

      {/* Create/Edit Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onCreateCategory={handleCreateCategory}
        editCategory={editingCategory}
      />

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}