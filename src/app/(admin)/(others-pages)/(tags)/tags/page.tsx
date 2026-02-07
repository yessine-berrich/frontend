'use client';

import { useState, useEffect, useCallback } from 'react';
import CreateTagModal from '@/components/modals/CreateTagModal';
import TagsManager from '@/components/tags/tagsManager';
import { toast } from 'react-hot-toast'; // Recommandé pour les retours utilisateurs

interface TagItem {
  id: string;
  name: string;
  count: number;
  trending?: boolean;
  color?: string;
}

const API_URL = "http://localhost:3000/api/tags";

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FONCTIONS API ---

  // Charger les tags depuis le serveur
  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      
      const data = await response.json();
      
      // Adaptation des données NestJS -> Format TagItem
      const formattedTags: TagItem[] = data.map((tag: any) => ({
        id: tag.id.toString(),
        name: tag.name,
        // On compte les articles liés pour définir la popularité/tendance
        count: tag.articles ? tag.articles.length : 0,
        trending: tag.articles && tag.articles.length > 5,
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      }));
      
      setTags(formattedTags);
    } catch (error) {
      console.error(error);
      toast.error("Impossible de récupérer les tags");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Créer un tag (POST)
  const handleCreateTag = async (tagName: string) => {
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error("Vous n'avez pas les droits");
        throw new Error('Erreur de création');
      }

      toast.success('Tag créé avec succès');
      fetchTags(); // Rafraîchir la liste
      setIsCreateModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Supprimer un tag (DELETE)
  const handleDeleteTag = async (id: string) => {
    const token = localStorage.getItem('auth_token');
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) throw new Error('Suppression échouée');

        setTags(prev => prev.filter(tag => tag.id !== id));
        toast.success('Tag supprimé');
      } catch (error: any) {
        toast.error("Erreur : Vérifiez vos permissions (Admin requis)");
      }
    }
  };

  // --- 2. RENDU ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des Tags
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Connecté à la base de données KnowledgeHub
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2">
              <span className="font-medium text-gray-900 dark:text-white">{tags.length}</span> tags
              <span className="mx-2">•</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {tags.filter(t => t.trending).length}
              </span> tendances
            </div>
          </div>
        </div>

        {/* Tags Manager Component */}
        <TagsManager
          tags={tags}
          onDeleteTag={handleDeleteTag}
          onSearch={() => {}} // Géré en interne par TagsManager
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateTagClick={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* Create Tag Modal */}
      <CreateTagModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTag={handleCreateTag}
      />

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}