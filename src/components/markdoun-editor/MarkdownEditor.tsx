// components/markdown-editor/MarkdownEditor.tsx
'use client';

import { useRef } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  Loader2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table,
  FileCode,
  CheckSquare,
  Minus,
  Type
} from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';


interface MarkdownEditorProps {
  content: string;
  setContent: (content: string) => void;
  isSubmitting: boolean;
  isUploadingImage: boolean;
  uploadProgress: number;
  fileInputRef: React.RefObject<HTMLInputElement>;
  insertMarkdown: (type: string, value?: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

export default function MarkdownEditor({
  content,
  setContent,
  isSubmitting,
  isUploadingImage,
  uploadProgress,
  fileInputRef,
  insertMarkdown,
  handleImageUpload,
  showPreview,
  setShowPreview
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Contenu <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {content.length} caractères • {content.split(/\s+/).filter(word => word.length > 0).length} mots
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors disabled:opacity-50 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Eye size={16} />
            {showPreview ? 'Éditer' : 'Aperçu'}
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-[300px] border border-gray-300 dark:border-gray-700">
          {content ? (
            <MarkdownPreview content={content} />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 italic text-center py-10">
              Rien à prévisualiser. Commencez à écrire !
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-t-lg">
            <div className="flex items-center gap-1 mr-2 border-r border-gray-300 dark:border-gray-700 pr-2">
              <button 
                onClick={() => insertMarkdown('heading1')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Titre 1 (Ctrl+1)"
              >
                <Heading1 size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => insertMarkdown('heading2')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Titre 2 (Ctrl+2)"
              >
                <Heading2 size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => insertMarkdown('heading3')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Titre 3 (Ctrl+3)"
              >
                <Heading3 size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-1 mr-2 border-r border-gray-300 dark:border-gray-700 pr-2">
              <button 
                onClick={() => insertMarkdown('bold')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Gras (Ctrl+B)"
              >
                <Bold size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => insertMarkdown('italic')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Italique (Ctrl+I)"
              >
                <Italic size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-1 mr-2 border-r border-gray-300 dark:border-gray-700 pr-2">
              <button 
                onClick={() => insertMarkdown('list')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Liste à puces"
              >
                <List size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => insertMarkdown('orderedlist')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Liste numérotée"
              >
                <ListOrdered size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => insertMarkdown('checkbox')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Case à cocher"
              >
                <CheckSquare size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-1 mr-2 border-r border-gray-300 dark:border-gray-700 pr-2">
              <button 
                onClick={() => insertMarkdown('code')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Code inline"
              >
                <Code size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => insertMarkdown('codeblock')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Bloc de code"
              >
                <FileCode size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-1 mr-2 border-r border-gray-300 dark:border-gray-700 pr-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                disabled={isSubmitting}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploadingImage}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 flex items-center gap-1" 
                title="Insérer une image"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-xs">{uploadProgress}%</span>
                  </>
                ) : (
                  <ImageIcon size={18} className="text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <button 
                onClick={() => insertMarkdown('link')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Insérer un lien (Ctrl+K)"
              >
                <LinkIcon size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => insertMarkdown('quote')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Citation"
              >
                <Quote size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => insertMarkdown('table')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Tableau"
              >
                <Table size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
              <button 
                onClick={() => insertMarkdown('hr')}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50" 
                title="Ligne horizontale"
              >
                <Minus size={18} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Éditeur */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# Bienvenue dans l'éditeur Markdown !

## Fonctionnalités disponibles :
- **Gras** avec ** ou Ctrl+B
- *Italique* avec * ou Ctrl+I
- \`Code inline\` avec backticks
- Listes avec - ou 1.
- ![images](url)
- [liens](url)
- > Citations
- \`\`\`blocs de code\`\`\`
- Et bien plus !`}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 border-t-0 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[300px] resize-y custom-scrollbar disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed bg-white dark:bg-gray-800 font-mono text-sm"
              spellCheck="true"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Type size={12} />
              <span>Markdown supporté</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}