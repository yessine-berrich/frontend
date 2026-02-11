'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  Send, 
  ChevronDown, 
  Heart, 
  Trash2,
  Reply
} from 'lucide-react';
import { fetchCurrentUser } from '../../../services/auth.service';

interface CommentAuthor {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
}

interface Comment {
  id: number;
  content: string;
  likes: number;
  isEdited?: boolean;
  isLiked?: boolean;
  author: CommentAuthor;
  parentId?: number | null;
  replies?: Comment[];
  createdAt: string;
}

interface CommentsSectionProps {
  articleId: number;
}

export default function CommentsSection({ articleId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Charger l'utilisateur courant
  useEffect(() => {
    fetchCurrentUser()
      .then((userData) => {
        setCurrentUser(userData);
        setCurrentUserId(userData.id);
      })
      .catch(() => {
        setCurrentUser(null);
        setCurrentUserId(null);
      });
  }, []);

  // Charger les commentaires
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/comments/article/${articleId}`);
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error(err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Envoyer un commentaire
  const handleSendComment = async () => {
    if (!newComment.trim() || !currentUserId) return;
    
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          articleId,
          content: newComment.trim(),
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la création');
      
      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  // Répondre à un commentaire
  const handleReply = async (commentId: number) => {
    if (!replyContent.trim() || !currentUserId) return;
    
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          articleId,
          content: replyContent.trim(),
          parentId: commentId,
        }),
      });
      
      if (!response.ok) throw new Error('Erreur lors de la réponse');
      
      setReplyContent('');
      setActiveReplyId(null);
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  // Supprimer un commentaire
  const handleDelete = async (commentId: number) => {
    if (!confirm('Supprimer ce commentaire ?')) return;
    
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  // Liker/Unliker un commentaire
  const handleLike = async (commentId: number) => {
    if (!currentUserId) {
      alert('Connectez-vous pour liker');
      return;
    }

    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
      });
      
      if (!response.ok) throw new Error('Erreur lors du like');
      
      // Mise à jour OPTIMISTE
      const result = await response.json();
      
      setComments(prevComments => 
        updateCommentLikes(prevComments, commentId, result.likes, result.isLiked)
      );
      
    } catch (err) {
      console.error(err);
    }
  };

  // Fonction utilitaire pour mettre à jour les likes récursivement
  const updateCommentLikes = (comments: Comment[], commentId: number, likes: number, isLiked: boolean): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes, isLiked };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentLikes(comment.replies, commentId, likes, isLiked)
        };
      }
      return comment;
    });
  };

  // Format date
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays > 0) return `il y a ${diffInDays} j`;
      if (diffInHours > 0) return `il y a ${diffInHours} h`;
      if (diffInMinutes > 0) return `il y a ${diffInMinutes} min`;
      return 'à l\'instant';
    } catch {
      return '';
    }
  };

  // Composant de commentaire individuel
  const CommentItem = ({ comment, level = 0 }: { comment: Comment; level?: number }) => {
    const isOwner = currentUserId === comment.author?.id;
    const [showReplies, setShowReplies] = useState(true);
    
    if (!comment.author) return null;

    const getInitials = () => {
      const firstName = comment.author.firstName || '';
      const lastName = comment.author.lastName || '';
      return firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : '?';
    };

    return (
      <div className={`${level > 0 ? 'ml-12' : ''} mb-4`}>
        {/* Commentaire principal - STYLE FACEBOOK */}
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br  rounded-full flex items-center justify-center text-white font-bold">
              {/* {getInitials()} */}

              <img 
                src={getProfileImageUrl(comment.author.id)}
                alt={comment.author.firstName + ' ' + comment.author.lastName || 'Utilisateur'}
                className="w-full h-full rounded-full object-cover"
              />


            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-500">(modifié)</span>
                )}
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>

            {/* Actions - Style Facebook */}
            <div className="flex items-center gap-4 mt-1 ml-1">
              <button
                onClick={() => handleLike(comment.id)}
                disabled={!currentUserId}
                className={`flex items-center gap-1 text-xs font-semibold ${
                  comment.isLiked 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                } disabled:opacity-50 transition-colors`}
              >
                <Heart size={14} className={comment.isLiked ? 'fill-blue-600' : ''} />
                <span>{comment.likes > 0 ? comment.likes : 'J\'aime'}</span>
              </button>

              {currentUserId && (
                <button
                  onClick={() => {
                    setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                    setReplyContent('');
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                >
                  Répondre
                </button>
              )}

              <span className="text-xs text-gray-500">
                {getTimeAgo(comment.createdAt)}
              </span>

              {isOwner && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>

            {/* Input de réponse */}
            {activeReplyId === comment.id && currentUserId && (
              <div className="mt-3 flex gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Répondre à ${comment.author.firstName}...`}
                    className="w-full px-4 py-2 pr-20 border border-gray-300 dark:border-gray-700 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && replyContent.trim()) {
                        handleReply(comment.id);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Répondre
                  </button>
                </div>
              </div>
            )}

            {/* Voir les réponses */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <ChevronDown size={14} className={`transform transition-transform ${showReplies ? '' : '-rotate-90'}`} />
                  {showReplies ? 'Masquer' : 'Voir'} {comment.replies.length} réponse{comment.replies.length > 1 ? 's' : ''}
                </button>

                {/* Réponses */}
                {showReplies && (
                  <div className="mt-3 space-y-3">
                    {comment.replies.map((reply) => (
                      <CommentItem 
                        key={reply.id} 
                        comment={reply} 
                        level={level + 1} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Filtrer seulement les commentaires racines
  const rootComments = comments.filter(comment => !comment.parentId);
  const totalCommentsCount = comments.length;

  const getProfileImageUrl = (id: any) => {
    // if (!userData?.id) return "/images/user/owner.jpg";
    
    // Si l'utilisateur a une image de profil dans la base de données
    // if (userData?.avatar) {
      // On ajoute un timestamp (?t=...) pour forcer le navigateur à ignorer le cache après un update
      return `http://localhost:3000/api/users/profile-image/${id}?t=${new Date().getTime()}`;
    // }
    
    // Image par défaut si pas d'image de profil
    // return "/images/user/owner.jpg";
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCommentsCollapsed(!commentsCollapsed)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="font-semibold">{totalCommentsCount} commentaire{totalCommentsCount > 1 ? 's' : ''}</span>
          </button>

          <button
            onClick={() => setCommentsCollapsed(!commentsCollapsed)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ChevronDown size={20} className={`transform transition-transform ${commentsCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Section commentaires */}
      {!commentsCollapsed && (
        <div className="px-4 pb-6">
          {/* Input nouveau commentaire - Style Facebook */}
          <div className="flex gap-3 mb-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {/* {currentUser?.firstName && currentUser?.lastName 
                  ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase()
                  : '?'} */}
                  <img 
                    src={getProfileImageUrl(currentUserId)}
                    alt={currentUser?.name || 'Utilisateur'}
                    className="w-full h-full rounded-full object-cover"
                  />
              </div>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={currentUserId ? "Écrire un commentaire..." : "Connectez-vous pour commenter"}
                className="w-full px-4 py-2 pr-20 border border-gray-300 dark:border-gray-700 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 dark:bg-gray-800"
                disabled={loading || !currentUserId}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newComment.trim() && currentUserId) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
              />
              <button
                onClick={handleSendComment}
                disabled={!newComment.trim() || loading || !currentUserId}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '...' : 'Publier'}
              </button>
            </div>
          </div>

          {/* Liste des commentaires */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : rootComments.length > 0 ? (
            <div className="space-y-4">
              {rootComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                Soyez le premier à commenter !
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}