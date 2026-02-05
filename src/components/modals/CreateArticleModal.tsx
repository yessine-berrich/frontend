'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
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
  Upload,
  CheckSquare,
  Minus,
  Type
} from 'lucide-react';

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface Category {
  id: number;
  value: number;
  label: string;
  icon: string;
}

interface Tag {
  id: number;
  name: string;
}

interface MediaDto {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

interface CreateArticleDto {
  title: string;
  content: string;
  categoryId: number;
  tagIds: number[];
  media?: MediaDto[];
  status?: 'DRAFT' | 'PENDING' | 'PUBLISHED';
}

// Composant pour afficher les notifications
const ToastContainer = ({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-5 py-4 rounded-lg shadow-lg backdrop-blur-sm animate-slideIn ${
            toast.type === 'success'
              ? 'bg-green-500/90 text-white'
              : toast.type === 'error'
              ? 'bg-red-500/90 text-white'
              : 'bg-blue-500/90 text-white'
          }`}
        >
          <p className="font-medium">{toast.message}</p>
          <button onClick={() => onDismiss(toast.id)} className="hover:opacity-80">
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Composant Markdown Preview
const MarkdownPreview = ({ content }: { content: string }) => {
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-5 mb-3 text-gray-800 dark:text-gray-100">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2 text-gray-700 dark:text-gray-200">{line.substring(4)}</h3>;
      }
      
      // Bold
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic
      line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Code inline
      line = line.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
      // Links
      line = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');
      
      // Blockquote
      if (line.startsWith('> ')) {
        return <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 my-3 text-gray-600 dark:text-gray-300 italic">{line.substring(2)}</blockquote>;
      }
      
      // List items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={index} className="ml-6 my-1">{line.substring(2)}</li>;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={index} className="ml-6 my-1 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      }
      
      // Code block
      if (line.startsWith('```')) {
        const codeBlockEnd = text.indexOf('```', index + 3);
        if (codeBlockEnd !== -1) {
          const codeContent = text.substring(index + 3, codeBlockEnd);
          return (
            <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm">
              <code>{codeContent}</code>
            </pre>
          );
        }
      }
      
      // Image
      const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        return (
          <div key={index} className="my-4">
            <img 
              src={imageMatch[2]} 
              alt={imageMatch[1]} 
              className="max-w-full h-auto rounded-lg shadow-md"
            />
            {imageMatch[1] && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">{imageMatch[1]}</p>}
          </div>
        );
      }
      
      // Table
      if (line.includes('|')) {
        const cells = line.split('|').filter(cell => cell.trim());
        if (cells.length > 1) {
          return (
            <tr key={index}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                  {cell.trim()}
                </td>
              ))}
            </tr>
          );
        }
      }
      
      // Horizontal rule
      if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        return <hr key={index} className="my-6 border-gray-300 dark:border-gray-700" />;
      }
      
      // Paragraph
      if (line.trim()) {
        return <p key={index} className="my-3 leading-relaxed text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: line }} />;
      }
      
      return <br key={index} />;
    });
  };

  return (
    <div className="prose dark:prose-invert max-w-none">
      {renderMarkdown(content)}
    </div>
  );
};

export default function CreateArticleModal({ isOpen, onClose, onSuccess }: CreateArticleModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<number | ''>('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMedia, setUploadedMedia] = useState<MediaDto[]>([]);

  // États pour les données dynamiques
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les catégories et tags au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      // Charger les catégories
      const categoriesResponse = await fetch('http://localhost:3000/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.map((cat: any) => ({
          id: cat.id,
          value: cat.id,
          label: cat.name,
          icon: cat.icon || '📁',
        })));
      }

      // Charger les tags
      const tagsResponse = await fetch('http://localhost:3000/api/tags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setAvailableTags(tagsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showToast('error', '❌ Erreur lors du chargement des données');
    } finally {
      setIsLoadingData(false);
    }
  };

  const showToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const validateForm = () => {
    if (!title.trim()) {
      showToast('error', 'Le titre est obligatoire');
      return false;
    }
    if (!category || category === '') {
      showToast('error', 'Veuillez sélectionner une catégorie');
      return false;
    }
    if (!content.trim()) {
      showToast('error', 'Le contenu ne peut pas être vide');
      return false;
    }
    if (selectedTags.length === 0) {
      showToast('error', 'Ajoutez au moins un tag');
      return false;
    }
    return true;
  };

  const insertMarkdown = (type: string, value?: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = content;

    switch (type) {
      case 'heading1':
        newText = content.substring(0, start) + `# ${selectedText || 'Titre 1'}\n` + content.substring(end);
        break;
      case 'heading2':
        newText = content.substring(0, start) + `## ${selectedText || 'Titre 2'}\n` + content.substring(end);
        break;
      case 'heading3':
        newText = content.substring(0, start) + `### ${selectedText || 'Titre 3'}\n` + content.substring(end);
        break;
      case 'bold':
        newText = content.substring(0, start) + `**${selectedText || 'texte en gras'}**` + content.substring(end);
        break;
      case 'italic':
        newText = content.substring(0, start) + `*${selectedText || 'texte en italique'}*` + content.substring(end);
        break;
      case 'code':
        newText = content.substring(0, start) + `\`${selectedText || 'code'}\`` + content.substring(end);
        break;
      case 'codeblock':
        const language = prompt('Langage du code (js, python, html, etc.) :', 'javascript');
        newText = content.substring(0, start) + `\`\`\`${language || ''}\n${selectedText || '// Votre code ici'}\n\`\`\`\n` + content.substring(end);
        break;
      case 'list':
        newText = content.substring(0, start) + `\n- ${selectedText || 'élément de liste'}\n` + content.substring(end);
        break;
      case 'orderedlist':
        newText = content.substring(0, start) + `\n1. ${selectedText || 'élément numéroté'}\n` + content.substring(end);
        break;
      case 'quote':
        newText = content.substring(0, start) + `> ${selectedText || 'Citation'}\n` + content.substring(end);
        break;
      case 'link':
        const url = prompt('URL du lien :', 'https://');
        if (url) {
          newText = content.substring(0, start) + `[${selectedText || 'texte du lien'}](${url})` + content.substring(end);
        }
        break;
      case 'image':
        const imageUrl = prompt('URL de l\'image :', 'https://');
        const altText = prompt('Texte alternatif :', '');
        if (imageUrl) {
          newText = content.substring(0, start) + `![${altText || ''}](${imageUrl})` + content.substring(end);
        }
        break;
      case 'table':
        const rows = prompt('Nombre de lignes :', '3');
        const cols = prompt('Nombre de colonnes :', '3');
        if (rows && cols) {
          let table = '\n';
          table += '|';
          for (let i = 0; i < parseInt(cols); i++) {
            table += ` Header ${i+1} |`;
          }
          table += '\n|';
          for (let i = 0; i < parseInt(cols); i++) {
            table += ' --- |';
          }
          table += '\n';
          for (let i = 0; i < parseInt(rows); i++) {
            table += '|';
            for (let j = 0; j < parseInt(cols); j++) {
              table += ` Cell ${i+1}-${j+1} |`;
            }
            table += '\n';
          }
          newText = content.substring(0, start) + table + content.substring(end);
        }
        break;
      case 'checkbox':
        newText = content.substring(0, start) + `- [ ] ${selectedText || 'tâche à faire'}\n` + content.substring(end);
        break;
      case 'hr':
        newText = content.substring(0, start) + `\n---\n` + content.substring(end);
        break;
      default:
        break;
    }

    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + newText.length - content.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'L\'image est trop lourde. Maximum 5MB.');
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simuler la progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload réel vers votre API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Échec de l\'upload');
      }

      const data = await response.json();
      const imageUrl = data.url;

      // Ajouter aux médias uploadés
      const mediaDto: MediaDto = {
        url: imageUrl,
        filename: file.name,
        mimetype: file.type,
        size: file.size,
      };
      setUploadedMedia(prev => [...prev, mediaDto]);

      // Insérer dans le contenu
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const altText = prompt('Texte alternatif pour l\'image :', file.name);
        const newText = content.substring(0, start) + `\n![${altText || 'image'}](${imageUrl})\n` + content.substring(start);
        setContent(newText);
      }

      showToast('success', '✅ Image téléchargée avec succès !');
    } catch (error) {
      console.error('Erreur upload:', error);
      showToast('error', '❌ Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const articleDto: CreateArticleDto = {
        title,
        content,
        categoryId: category,
        tagIds: selectedTags,
        media: uploadedMedia,
        status: 'DRAFT',
      };

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(articleDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      const savedArticle = await response.json();
      console.log('Brouillon sauvegardé:', savedArticle);
      
      showToast('success', '✅ Brouillon sauvegardé avec succès !');
      
      setTimeout(() => {
        resetForm();
        onSuccess?.();
      }, 1000);
    } catch (error: any) {
      console.error('Erreur:', error);
      showToast('error', `❌ ${error.message || 'Erreur lors de la sauvegarde'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForValidation = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const articleDto: CreateArticleDto = {
        title,
        content,
        categoryId: category,
        tagIds: selectedTags,
        media: uploadedMedia,
        status: 'pending',
      };

      const response = await fetch('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(articleDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la soumission');
      }

      const submittedArticle = await response.json();
      console.log('Article soumis:', submittedArticle);
      
      showToast('success', '✅ Article soumis pour validation !');
      
      setTimeout(() => {
        resetForm();
        onClose();
        onSuccess?.();
      }, 1000);
    } catch (error: any) {
      console.error('Erreur:', error);
      showToast('error', `❌ ${error.message || 'Erreur lors de la soumission'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setContent('');
    setSelectedTags([]);
    setUploadedMedia([]);
    setShowPreview(false);
  };

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current || !isOpen) return;
      
      if ((e.ctrlKey || e.metaKey) && textareaRef.current === document.activeElement) {
        e.preventDefault();
        switch (e.key) {
          case 'b':
            insertMarkdown('bold');
            break;
          case 'i':
            insertMarkdown('italic');
            break;
          case 'k':
            insertMarkdown('link');
            break;
          case 'e':
            insertMarkdown('code');
            break;
          case '1':
            insertMarkdown('heading1');
            break;
          case '2':
            insertMarkdown('heading2');
            break;
          case '3':
            insertMarkdown('heading3');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, content]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Créer un article</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6 custom-scrollbar">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement...</span>
              </div>
            ) : (
              <>
                {/* Title */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Donnez un titre accrocheur à votre article..."
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed bg-white dark:bg-gray-800"
                  />
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : '')}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white appearance-none bg-white dark:bg-gray-800 cursor-pointer disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Editor */}
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

                {/* Tags */}
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
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-8 py-5 flex items-center justify-between z-10">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p className="flex items-center gap-1">
                <span>💡</span>
                <span>Utilisez Ctrl+B pour gras, Ctrl+I pour italique, etc.</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting || isLoadingData}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                Sauvegarder brouillon
              </button>
              <button
                onClick={handleSubmitForValidation}
                disabled={isSubmitting || isLoadingData}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                Soumettre pour validation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }

        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </>
  );
}