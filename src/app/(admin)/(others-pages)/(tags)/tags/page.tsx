'use client';

import { useState, useEffect } from 'react';
import CreateTagModal from '@/components/modals/CreateTagModal';
import TagsManager from '@/components/tags/tagsManager';


interface TagItem {
  id: string;
  name: string;
  count: number;
  trending?: boolean;
  color?: string;
}

const initialTags: TagItem[] = [
  { id: '1', name: 'React', count: 45, trending: true, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: '2', name: 'TypeScript', count: 38, trending: true, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: '3', name: 'JavaScript', count: 32, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  { id: '4', name: 'Node.js', count: 28, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { id: '5', name: 'Next.js', count: 35, trending: true, color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300' },
  { id: '6', name: 'NestJS', count: 22, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { id: '7', name: 'PostgreSQL', count: 19, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: '8', name: 'MongoDB', count: 17, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { id: '9', name: 'Docker', count: 24, trending: true, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: '10', name: 'Kubernetes', count: 21, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: '11', name: 'Tailwind', count: 12, trending: true, color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
  { id: '12', name: 'GraphQL', count: 15, color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
  { id: '13', name: 'REST API', count: 14, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { id: '14', name: 'OpenAI', count: 18, trending: true, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { id: '15', name: 'LangChain', count: 10, trending: true, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { id: '16', name: 'IA', count: 15, trending: true, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { id: '17', name: 'LLM', count: 6, trending: true, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  { id: '18', name: 'DevOps', count: 25, color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300' },
  { id: '19', name: 'Microservices', count: 20, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
  { id: '20', name: 'AWS', count: 14, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
];

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud');
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les tags depuis localStorage au montage
  useEffect(() => {
    const savedTags = localStorage.getItem('knowledgehub-tags');
    if (savedTags) {
      try {
        setTags(JSON.parse(savedTags));
      } catch (error) {
        console.error('Erreur lors du chargement des tags:', error);
      }
    }
  }, []);

  // Sauvegarder les tags dans localStorage quand ils changent
  useEffect(() => {
    localStorage.setItem('knowledgehub-tags', JSON.stringify(tags));
  }, [tags]);

  const handleCreateTag = (tagName: string) => {
    const newTag: TagItem = {
      id: Date.now().toString(),
      name: tagName,
      count: 0,
      color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
    };
    setTags(prev => [...prev, newTag]);
  };

  const handleDeleteTag = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
      setTags(prev => prev.filter(tag => tag.id !== id));
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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
              Organisez vos connaissances avec des tags
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
          onSearch={handleSearch}
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