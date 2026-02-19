// components/modals/CreateArticleModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import MarkdownEditor, { MarkdownEditorRef } from '../markdoun-editor/MarkdownEditor';
import TagsSelector from '../tags/TagsSelector';
import { articleService } from '../../../services/article.service';
import type { UpdateArticleDto } from '../../../services/article.service';
import type { CreateArticleDto } from '../../../services/article.service';
import type { Article } from '../../../services/article.service';

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  articleId?: string;
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

export default function CreateArticleModal({ isOpen, onClose, onSuccess, articleId }: CreateArticleModalProps) {
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [originalArticle, setOriginalArticle] = useState<Article | null>(null);
  const markdownEditorRef = useRef<MarkdownEditorRef>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!articleId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  // Charger les catégories et tags au montage du composant
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (isEditMode) {
        loadArticleData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, articleId]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      // Charger les catégories
      const categoriesResponse = await fetch(`${API_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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
      const tagsResponse = await fetch(`${API_URL}/tags`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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

  const loadArticleData = async () => {
    if (!articleId) return;
    
    setIsLoadingArticle(true);
    try {
      const article = await articleService.findOne(parseInt(articleId));
      setOriginalArticle(article as any);
      
      setTitle(article.title);
      setCategory(article.category.id);
      setContent(article.content);
      
      if (article.tags) {
        setSelectedTags(article.tags.map(tag => tag.id));
      }
      
    } catch (error: any) {
      console.error('Erreur lors du chargement de l\'article:', error);
      showToast('error', `❌ ${error.message || 'Erreur lors du chargement de l\'article'}`);
    } finally {
      setIsLoadingArticle(false);
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

  const associateTagsToArticle = async (articleId: number) => {
    try {
      const response = await fetch(`${API_URL}/articles/${articleId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ tagIds: selectedTags }),
      });

      if (!response.ok) {
        console.warn('Erreur lors de l\'association des tags');
      }
    } catch (error) {
      console.error('Erreur tags:', error);
    }
  };

  const uploadMedia = async (articleId: number) => {
    if (uploadedMedia.length === 0) return;
    
    try {
      const response = await fetch(`${API_URL}/articles/${articleId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ media: uploadedMedia }),
      });

      if (!response.ok) {
        console.warn('Erreur lors de l\'upload des médias');
      }
    } catch (error) {
      console.error('Erreur media:', error);
    }
  };

  const buildUpdateDto = (status: 'DRAFT' | 'PENDING'): UpdateArticleDto | null => {
    if (!isEditMode || !originalArticle) return null;
    
    const dto: UpdateArticleDto = {};
    let hasChanges = false;

    if (title !== originalArticle.title) {
      dto.title = title;
      hasChanges = true;
    }
    
    if (content !== originalArticle.content) {
      dto.content = content;
      hasChanges = true;
    }
    
    if (category !== originalArticle.category.id) {
      dto.categoryId = category as number;
      hasChanges = true;
    }
    
    const originalTagIds = originalArticle.tags.map(t => t.id).sort();
    const currentTagIds = [...selectedTags].sort();
    if (JSON.stringify(originalTagIds) !== JSON.stringify(currentTagIds)) {
      dto.tagIds = selectedTags;
      hasChanges = true;
    }

    dto.status = status;
    dto.changeSummary = status === 'draft' 
      ? 'Mise à jour du brouillon' 
      : 'Soumission pour validation';

    return { ...dto, hasChanges } as any;
  };
const insertMarkdown = (type: string) => {
  console.log('Insert markdown called:', type);
  
  // Utiliser la référence de l'éditeur
  const textarea = markdownEditorRef.current?.textarea;
  
  if (!textarea) {
    console.log('❌ Textarea ref is null');
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.substring(start, end);
  let newText = content;
  let newCursorPos = start;

  switch (type) {
    case 'heading1':
      newText = content.substring(0, start) + `# ${selectedText || 'Titre 1'}\n` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 3 : 9);
      break;
    case 'heading2':
      newText = content.substring(0, start) + `## ${selectedText || 'Titre 2'}\n` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 4 : 10);
      break;
    case 'heading3':
      newText = content.substring(0, start) + `### ${selectedText || 'Titre 3'}\n` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 5 : 11);
      break;
    case 'bold':
      newText = content.substring(0, start) + `**${selectedText || 'texte en gras'}**` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 4 : 17);
      break;
    case 'italic':
      newText = content.substring(0, start) + `*${selectedText || 'texte en italique'}*` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 2 : 19);
      break;
    case 'code':
      newText = content.substring(0, start) + `\`${selectedText || 'code'}\`` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 2 : 6);
      break;
    case 'codeblock':
      const language = prompt('Langage du code :', 'javascript') || '';
      newText = content.substring(0, start) + `\`\`\`${language}\n${selectedText || '// Votre code ici'}\n\`\`\`\n` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + language.length + 8 : language.length + 25);
      break;
    case 'list':
      newText = content.substring(0, start) + `- ${selectedText || 'élément de liste'}\n` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 2 : 18);
      break;
    case 'orderedlist':
      newText = content.substring(0, start) + `1. ${selectedText || 'élément numéroté'}\n` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 3 : 20);
      break;
    case 'checkbox':
      newText = content.substring(0, start) + `- [ ] ${selectedText || 'tâche à faire'}\n` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 6 : 19);
      break;
    case 'quote':
      newText = content.substring(0, start) + `> ${selectedText || 'Citation'}\n` + content.substring(end);
      newCursorPos = start + (selectedText ? selectedText.length + 2 : 10);
      break;
    case 'link':
      const url = prompt('URL du lien :', 'https://');
      if (url) {
        newText = content.substring(0, start) + `[${selectedText || 'texte du lien'}](${url})` + content.substring(end);
        newCursorPos = start + (selectedText ? selectedText.length + url.length + 4 : url.length + 15);
      } else {
        return;
      }
      break;
    case 'table':
      newText = content.substring(0, start) + 
        '\n| Colonne 1 | Colonne 2 | Colonne 3 |\n' +
        '|-----------|-----------|-----------|\n' +
        '| Cellule 1 | Cellule 2 | Cellule 3 |\n' +
        '| Cellule 4 | Cellule 5 | Cellule 6 |\n' + content.substring(end);
      newCursorPos = start + 15;
      break;
    case 'hr':
      newText = content.substring(0, start) + `\n---\n` + content.substring(end);
      newCursorPos = start + 5;
      break;
    default:
      return;
  }

  console.log('✅ Updating content');
  setContent(newText);
  
  // Restaurer la position du curseur après la mise à jour
  setTimeout(() => {
    const updatedTextarea = markdownEditorRef.current?.textarea;
    if (updatedTextarea) {
      updatedTextarea.focus();
      updatedTextarea.setSelectionRange(newCursorPos, newCursorPos);
    }
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

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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

      const mediaDto: MediaDto = {
        url: imageUrl,
        filename: file.name,
        mimetype: file.type,
        size: file.size,
      };
      setUploadedMedia(prev => [...prev, mediaDto]);

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

  // ✅ GESTION DU BROUILLON
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && articleId) {
        // 📝 MODE ÉDITION - Envoyer UNIQUEMENT les champs modifiés
        const updateDto = buildUpdateDto('draft');
        
        if (!updateDto || !(updateDto as any).hasChanges) {
          showToast('info', 'Aucune modification détectée');
          setIsSubmitting(false);
          return;
        }

        // Nettoyer la propriété hasChanges avant d'envoyer
        const { hasChanges, ...dtoToSend } = updateDto as any;
        
        const savedArticle = await articleService.update(parseInt(articleId), dtoToSend);
        showToast('success', '✅ Brouillon mis à jour avec succès !');
        
        // Mettre à jour l'article original avec les nouvelles valeurs
        setOriginalArticle(prev => ({
          ...prev!,
          title: title,
          content: content,
          category: { ...prev!.category, id: category as number },
          tags: availableTags.filter(t => selectedTags.includes(t.id)),
          status: 'draft'
        }));
        
      } else {
        // ✨ MODE CRÉATION - DTO complet
        const createDto: CreateArticleDto = {
          title,
          content,
          categoryId: category as number,
          status: 'draft',
          tagIds: selectedTags,
        };
        
        const savedArticle = await articleService.create(createDto);
        showToast('success', '✅ Brouillon sauvegardé avec succès !');
        
        // Associer les tags après création
        if (selectedTags.length > 0) {
          await associateTagsToArticle(savedArticle.id);
        }
      }

      // Uploader les médias (si nécessaire)
      // if (uploadedMedia.length > 0) {
      //   await uploadMedia(savedArticle.id);
      // }
      
      setTimeout(() => {
        resetForm();
        onSuccess?.();
        if (!isEditMode) {
          onClose();
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Erreur:', error);
      showToast('error', `❌ ${error.message || 'Erreur lors de la sauvegarde'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ GESTION DE LA SOUMISSION POUR VALIDATION
  const handleSubmitForValidation = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && articleId) {
        // 📝 MODE ÉDITION - Envoyer UNIQUEMENT les champs modifiés
        const updateDto = buildUpdateDto('pending');
        
        if (!updateDto) {
          showToast('error', 'Erreur lors de la construction du DTO');
          setIsSubmitting(false);
          return;
        }

        // Nettoyer la propriété hasChanges avant d'envoyer
        const { hasChanges, ...dtoToSend } = updateDto as any;
        
        // Vérifier s'il y a des changements (hors statut et changeSummary)
        const hasContentChanges = Object.keys(dtoToSend).some(
          key => !['status', 'changeSummary'].includes(key)
        );

        if (!hasContentChanges) {
          // Pas de changements de contenu, seulement le statut
          const statusUpdate = { 
            status: 'pending',
            changeSummary: 'Soumission pour validation (aucun changement)'
          };
          await articleService.update(parseInt(articleId), statusUpdate);
          showToast('success', '✅ Article soumis pour validation !');
        } else {
          const submittedArticle = await articleService.update(parseInt(articleId), dtoToSend);
          showToast('success', '✅ Article mis à jour et soumis pour validation !');
          
          // Mettre à jour l'article original
          setOriginalArticle(prev => ({
            ...prev!,
            title: dtoToSend.title || prev!.title,
            content: dtoToSend.content || prev!.content,
            category: dtoToSend.categoryId 
              ? { ...prev!.category, id: dtoToSend.categoryId }
              : prev!.category,
            tags: dtoToSend.tagIds 
              ? availableTags.filter(t => dtoToSend.tagIds?.includes(t.id))
              : prev!.tags,
            status: 'pending'
          }));
        }
        
      } else {
        // ✨ MODE CRÉATION - DTO complet
        const createDto: CreateArticleDto = {
          title,
          content,
          categoryId: category as number,
          status: 'pending',
          tagIds: selectedTags,
        };
        
        const submittedArticle = await articleService.create(createDto);
        showToast('success', '✅ Article soumis pour validation !');
        
        // Associer les tags après création
        if (selectedTags.length > 0) {
          await associateTagsToArticle(submittedArticle.id);
        }
      }

      // Uploader les médias (si nécessaire)
      // if (uploadedMedia.length > 0) {
      //   await uploadMedia(savedArticle.id);
      // }
      
      setTimeout(() => {
        resetForm();
        onSuccess?.();
        onClose();
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
    setOriginalArticle(null);
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

  const modalTitle = isEditMode ? 'Modifier l\'article' : 'Créer un article';
  const draftButtonText = isEditMode ? 'Mettre à jour le brouillon' : 'Sauvegarder brouillon';
  const submitButtonText = isEditMode ? 'Mettre à jour et soumettre' : 'Soumettre pour validation';

  return (
    <>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={onClose}
        />
        
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{modalTitle}</h2>
              {isEditMode && originalArticle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Statut actuel : <span className="font-medium">{originalArticle.status}</span>
                </p>
              )}
            </div>
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
            {isLoadingData || (isEditMode && isLoadingArticle) ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  {isLoadingArticle ? 'Chargement de l\'article...' : 'Chargement...'}
                </span>
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

                {/* Markdown Editor */}
                <MarkdownEditor
                ref={markdownEditorRef} 
                  content={content}
                  setContent={setContent}
                  isSubmitting={isSubmitting}
                  isUploadingImage={isUploadingImage}
                  uploadProgress={uploadProgress}
                  fileInputRef={fileInputRef}
                  insertMarkdown={insertMarkdown}
                  handleImageUpload={handleImageUpload}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                />

                {/* Tags Selector */}
                <TagsSelector
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  toggleTag={toggleTag}
                  isSubmitting={isSubmitting}
                />
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
                disabled={isSubmitting || isLoadingData || (isEditMode && isLoadingArticle)}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {draftButtonText}
              </button>
              <button
                onClick={handleSubmitForValidation}
                disabled={isSubmitting || isLoadingData || (isEditMode && isLoadingArticle)}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {submitButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-[999999] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-4 rounded-lg shadow-2xl backdrop-blur-sm animate-slideIn ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
            }`}
          >
            <p className="font-medium">{toast.message}</p>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
              className="hover:opacity-80 transition-opacity"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

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