'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  ChevronUp, 
  ChevronDown, 
  Heart, 
  Edit,
  Trash2,
  Reply,
  User
} from 'lucide-react';

interface CommentAuthor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
  role: string;
  department?: string;
}

interface Comment {
  id: number;
  content: string;
  likes: number;
  isEdited?: boolean;
  isLiked?: boolean;
  author: CommentAuthor;
  parent?: Comment;
  replies?: Comment[];
  mentionedUsers?: CommentAuthor[];
  createdAt: string;
  updatedAt?: string;
}

interface CommentsSectionProps {
  articleId: number;
  currentUserId?: number;
  token?: string;
}

export default function CommentsSection({
  articleId,
  currentUserId,
  token
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<{[key: number]: string}>({});
  const [editContent, setEditContent] = useState<{[key: number]: string}>({});
  const [showReplies, setShowReplies] = useState<{[key: number]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Focus comment input when comments are expanded
  useEffect(() => {
    if (!commentsCollapsed && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [commentsCollapsed]);

  // Charger les commentaires depuis l'API
  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/comments/article/${articleId}`);
      if (!response.ok) throw new Error('Erreur de chargement des commentaires');
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  // Fonction utilitaire pour les headers d'authentification
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          articleId,
          content: newComment.trim(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout du commentaire');
      }
      
      setNewComment('');
      await fetchComments(); // Recharger depuis l'API
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId: number) => {
    const content = replyContent[commentId];
    if (!content?.trim()) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          articleId,
          content: content.trim(),
          parentId: commentId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la réponse');
      }
      
      setReplyContent(prev => ({ ...prev, [commentId]: '' }));
      setActiveReplyId(null);
      await fetchComments();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId: number) => {
    const content = editContent[commentId];
    if (!content?.trim()) return;

    try {
      setLoading(true);
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content: content.trim(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'édition');
      }
      
      setEditingCommentId(null);
      setEditContent(prev => ({ ...prev, [commentId]: '' }));
      await fetchComments();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      setLoading(true);
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }
      
      await fetchComments();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du like');
      }
      
      await fetchComments();
      
    } catch (err) {
      console.error('Erreur like:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = () => {
    setCommentsCollapsed(!commentsCollapsed);
    if (!commentsCollapsed && commentsSectionRef.current) {
      setTimeout(() => {
        commentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) {
      return `il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
    } else if (diffInDays > 0) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return 'il y a quelques minutes';
    }
  };

  const getAuthorName = (author: CommentAuthor) => {
    return `${author.firstName} ${author.lastName}`;
  };

  const getAuthorInitials = (author: CommentAuthor) => {
    return `${author.firstName.charAt(0)}${author.lastName.charAt(0)}`;
  };

  const isCommentOwner = (commentAuthorId: number) => {
    return currentUserId === commentAuthorId;
  };

  const totalCommentsCount = comments.reduce((acc, comment) => {
    return acc + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <>
      {/* Comments Section Container */}
      <div 
        ref={commentsSectionRef}
        className={`border-t border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          commentsCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'opacity-100'
        }`}
      >
        {/* Comments Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Commentaires ({totalCommentsCount})
            </h2>
            <button
              onClick={toggleComments}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={commentsCollapsed ? "Développer les commentaires" : "Réduire les commentaires"}
            >
              <ChevronUp size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Add Comment Form */}
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {currentUserId ? 'VO' : '?'}
              </div>
              <div className="flex-1 relative">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={currentUserId ? "Partagez votre avis sur cet article..." : "Connectez-vous pour commenter"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && currentUserId) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  disabled={loading || !currentUserId}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim() || loading || !currentUserId}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    newComment.trim() && !loading && currentUserId
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Envoyer le commentaire"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-500 hover:text-red-700"
              >
                Fermer
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {loading && !comments.length ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400">Chargement des commentaires...</p>
              </div>
            ) : comments.length > 0 ? (
              comments
                .filter(comment => !comment.parent) // Afficher seulement les commentaires parents
                .map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    level={0}
                    currentUserId={currentUserId}
                    isCommentOwner={isCommentOwner}
                    isReplying={activeReplyId === comment.id}
                    isEditing={editingCommentId === comment.id}
                    replyContent={replyContent[comment.id] || ''}
                    editContent={editContent[comment.id] || comment.content}
                    showReplies={showReplies[comment.id] || false}
                    onSetReplyContent={(content) => setReplyContent(prev => ({ ...prev, [comment.id]: content }))}
                    onSetEditContent={(content) => setEditContent(prev => ({ ...prev, [comment.id]: content }))}
                    onToggleReply={() => {
                      if (!currentUserId) {
                        setError('Connectez-vous pour répondre');
                        return;
                      }
                      setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                    }}
                    onToggleEdit={() => {
                      if (editingCommentId === comment.id) {
                        setEditingCommentId(null);
                      } else {
                        setEditingCommentId(comment.id);
                        setEditContent(prev => ({ ...prev, [comment.id]: comment.content }));
                      }
                    }}
                    onToggleReplies={() => setShowReplies(prev => ({ 
                      ...prev, 
                      [comment.id]: !prev[comment.id] 
                    }))}
                    onReply={() => handleReply(comment.id)}
                    onEdit={() => handleEdit(comment.id)}
                    onDelete={() => handleDelete(comment.id)}
                    onLike={() => handleLike(comment.id)}
                    getTimeAgo={getTimeAgo}
                    getAuthorName={getAuthorName}
                    getAuthorInitials={getAuthorInitials}
                  />
                ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Soyez le premier à commenter cet article !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleComments}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              aria-label={`${totalCommentsCount} commentaires`}
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{totalCommentsCount}</span>
            </button>
          </div>

          {/* Toggle Comments Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleComments}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                commentsCollapsed
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {commentsCollapsed ? (
                <>
                  <MessageCircle size={16} />
                  Voir les commentaires
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Réduire
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Sous-composant CommentItem
interface CommentItemProps {
  comment: Comment;
  level: number;
  currentUserId?: number;
  isCommentOwner: (authorId: number) => boolean;
  isReplying: boolean;
  isEditing: boolean;
  replyContent: string;
  editContent: string;
  showReplies: boolean;
  onSetReplyContent: (content: string) => void;
  onSetEditContent: (content: string) => void;
  onToggleReply: () => void;
  onToggleEdit: () => void;
  onToggleReplies: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLike: () => void;
  getTimeAgo: (dateString: string) => string;
  getAuthorName: (author: CommentAuthor) => string;
  getAuthorInitials: (author: CommentAuthor) => string;
}

function CommentItem({ 
  comment,
  level,
  currentUserId,
  isCommentOwner,
  isReplying,
  isEditing,
  replyContent,
  editContent,
  showReplies,
  onSetReplyContent,
  onSetEditContent,
  onToggleReply,
  onToggleEdit,
  onToggleReplies,
  onReply,
  onEdit,
  onDelete,
  onLike,
  getTimeAgo,
  getAuthorName,
  getAuthorInitials
}: CommentItemProps) {
  const isOwner = isCommentOwner(comment.author.id);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const indent = Math.min(level * 24, 96); // Limite l'indentation à 4 niveaux

  return (
    <div className="comment-item group" style={{ marginLeft: `${indent}px` }}>
      <div className="flex gap-3">
        {/* Avatar */}
        <button
          onClick={() => window.location.href = `/profile/${comment.author.id}`}
          className="relative group/avatar flex-shrink-0"
          aria-label={`Voir le profil de ${getAuthorName(comment.author)}`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden transition-transform group-hover/avatar:scale-105">
            {comment.author.profileImage ? (
              <img 
                src={comment.author.profileImage} 
                alt={getAuthorName(comment.author)}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getAuthorInitials(comment.author)
            )}
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-all ${
            isReplying ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => window.location.href = `/profile/${comment.author.id}`}
                    className="group/name flex items-center gap-1 max-w-full"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover/name:text-blue-600 transition-colors truncate">
                      {getAuthorName(comment.author)}
                    </h4>
                    <User size={12} className="text-gray-400 group-hover/name:text-blue-500 transition-colors flex-shrink-0" />
                  </button>
                  {comment.author.role && (
                    <>
                      <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">•</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {comment.author.role}
                      </span>
                    </>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {getTimeAgo(comment.createdAt)}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic flex-shrink-0">
                      (modifié)
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={onLike}
                  disabled={!currentUserId}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors group/like disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Aimer ce commentaire"
                >
                  <Heart
                    size={16}
                    className={`transition-transform ${
                      comment.isLiked ? 'fill-red-500 text-red-500' : 'group-hover/like:scale-110'
                    }`}
                  />
                  <span>{comment.likes}</span>
                </button>
              </div>
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => onSetEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={onEdit}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={onToggleEdit}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}
          </div>

          {/* Reply Input */}
          {isReplying && currentUserId && (
            <div className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => onSetReplyContent(e.target.value)}
                  placeholder={`Répondre à ${getAuthorName(comment.author)}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onReply();
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={onReply}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Répondre
                </button>
                <button
                  onClick={onToggleReply}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {currentUserId && (
              <button
                onClick={onToggleReply}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Reply size={14} />
                Répondre
              </button>
            )}

            {isOwner && currentUserId && (
              <>
                <button
                  onClick={onToggleEdit}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors flex items-center gap-1"
                >
                  <Edit size={14} />
                  Modifier
                </button>
                <button
                  onClick={onDelete}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              </>
            )}

            {hasReplies && (
              <button
                onClick={onToggleReplies}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {showReplies ? 'Masquer' : 'Afficher'} les réponses ({comment.replies?.length})
              </button>
            )}
          </div>

          {/* Replies Section */}
          {showReplies && hasReplies && comment.replies && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  level={level + 1}
                  currentUserId={currentUserId}
                  isCommentOwner={isCommentOwner}
                  isReplying={false}
                  isEditing={false}
                  replyContent=""
                  editContent=""
                  showReplies={false}
                  onSetReplyContent={() => {}}
                  onSetEditContent={() => {}}
                  onToggleReply={() => {}}
                  onToggleEdit={() => {}}
                  onToggleReplies={() => {}}
                  onReply={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onLike={() => {}}
                  getTimeAgo={getTimeAgo}
                  getAuthorName={getAuthorName}
                  getAuthorInitials={getAuthorInitials}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}