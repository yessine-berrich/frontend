// pour crate Article
'use client';

interface Tag {
  id: number;
  name: string;
}

interface TagsSelectorProps {
  availableTags: Tag[];
  selectedTags: number[];
  toggleTag: (tagId: number) => void;
  isSubmitting: boolean;
}

export default function TagsSelector({
  availableTags,
  selectedTags,
  toggleTag,
  isSubmitting
}: TagsSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Tags <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
              selectedTags.includes(tag.id)
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Tags sélectionnés :
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              return tag ? (
                <span 
                  key={tagId} 
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  {tag.name}
                  <button 
                    onClick={() => toggleTag(tagId)}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}