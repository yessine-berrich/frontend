'use client';

import { useState, useEffect } from 'react';
import CreateCategoryModal from '@/components/modals/CreateCategoryModal';
import CategoriesManager from '@/components/categories/CategoriesManager';
import { categoryService, Category as ApiCategory } from '../../../../../../services/category.service';
import { articleService } from '../../../../../../services/article.service';

interface Category {
  id: string;
  name: string;
  description: string;
  articleCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les catégories depuis l'API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les catégories
      const apiCategories = await categoryService.findAll();
      
      // Récupérer tous les articles pour compter par catégorie
      let articlesByCategory: Record<number, number> = {};
      try {
        const articles = await articleService.findAll();
        articlesByCategory = articles.reduce((acc, article) => {
          if (article.category?.id) {
            acc[article.category.id] = (acc[article.category.id] || 0) + 1;
          }
          return acc;
        }, {} as Record<number, number>);
      } catch (err) {
        console.error('Erreur chargement articles:', err);
      }

      // Transformer pour le frontend
      const frontendCategories: Category[] = apiCategories.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        description: cat.description || '',
        articleCount: articlesByCategory[cat.id] || 0,
      }));

      setCategories(frontendCategories);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
      setError('Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: {
    name: string;
    description: string;
  }) => {
    try {
      if (editingCategory) {
        // Mise à jour
        await categoryService.update(Number(editingCategory.id), categoryData);
      } else {
        // Création
        await categoryService.create(categoryData);
      }
      
      // Recharger les catégories
      await loadCategories();
      handleCloseModal();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  const handleDeleteCategory = async (id: string | number) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    const message = category.articleCount > 0
      ? `Êtes-vous sûr de vouloir supprimer "${category.name}" ? Cette catégorie contient ${category.articleCount} article(s).`
      : `Êtes-vous sûr de vouloir supprimer "${category.name}" ?`;

    if (window.confirm(message)) {
      try {
        await categoryService.delete(Number(id));
        await loadCategories();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de la catégorie');
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  const handleViewArticles = (categoryId: string | number) => {
    // Navigation vers la page des articles avec filtre
    window.location.href = `/articles?category=${categoryId}`;
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadCategories}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
        editCategory={editingCategory ? {
          id: editingCategory.id,
          name: editingCategory.name,
          description: editingCategory.description
        } : null}
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