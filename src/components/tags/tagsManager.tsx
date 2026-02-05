// app/components/tags/TagsManager.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tag, TrendingUp, Hash, Search, Plus, X } from "lucide-react"; // Ajoutez Plus et X ici

interface TagItem {
  id: string;
  name: string;
  count: number;
  trending?: boolean;
  color?: string;
}

interface TagsManagerProps {
  tags: TagItem[];
  onDeleteTag: (id: string) => void;
  onSearch: (query: string) => void;
  viewMode: "cloud" | "list";
  onViewModeChange: (mode: "cloud" | "list") => void;
  onCreateTagClick: () => void;
}

export default function TagsManager({
  tags,
  onDeleteTag,
  onSearch,
  viewMode,
  onViewModeChange,
  onCreateTagClick,
}: TagsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTags = useMemo(() => {
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  const trendingTags = useMemo(() => {
    return tags.filter(tag => tag.trending);
  }, [tags]);

  const sortedTags = useMemo(() => {
    return [...filteredTags].sort((a, b) => b.count - a.count);
  }, [filteredTags]);

  const maxCount = useMemo(() => {
    return Math.max(...tags.map(t => t.count));
  }, [tags]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const getTagSize = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "text-2xl font-bold px-6 py-3";
    if (ratio > 0.5) return "text-xl font-semibold px-5 py-2.5";
    if (ratio > 0.3) return "text-lg font-medium px-4 py-2";
    return "text-base px-3 py-1.5";
  };

  const getTagColor = (tag: TagItem) => {
    if (tag.color) return tag.color;
    if (tag.trending) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tags</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{tags.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tags tendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{trendingTags.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Utilisation totale</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tags.reduce((sum, tag) => sum + tag.count, 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Hash className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un tag..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Tags tendance</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Les plus utilisés cette semaine
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag.id}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
              >
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">{tag.name}</span>
                <span className="text-xs opacity-80">{tag.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 border border-gray-200 dark:border-gray-800 rounded-lg p-1 bg-white dark:bg-gray-900">
            <button
              onClick={() => onViewModeChange('cloud')}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                viewMode === 'cloud'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Vue nuage
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Vue liste
            </button>
        </div>
        <button
          onClick={onCreateTagClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau tag
        </button>
      </div>

      {/* Tags Display */}
      {viewMode === "cloud" ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8">
          {sortedTags.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {sortedTags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <button
                    className={`${getTagSize(tag.count)} rounded-xl transition-all hover:scale-110 hover:shadow-lg ${getTagColor(tag)}`}
                  >
                    <Hash className="inline h-4 w-4 mr-2 opacity-60" />
                    {tag.name}
                    <span className="ml-2 text-xs opacity-70">({tag.count})</span>
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun tag ne correspond à votre recherche</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          {sortedTags.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedTags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTagColor(tag)}`}>
                      <Hash className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">{tag.name}</span>
                        {tag.trending && (
                          <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xs flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Tendance
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Utilisé dans {tag.count} article{tag.count > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Supprimer le tag"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun tag trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}