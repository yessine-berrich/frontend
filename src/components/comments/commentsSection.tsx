'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  ChevronUp, 
  ChevronDown, 
  Heart, 
  Trash2,
  Reply
} from 'lucide-react';

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
  parentId?: number;
  replies?: Comment[];
  createdAt: string;
}

interface CommentsSectionProps {
  articleId: number;
  currentUserId?: number;
}

export default function CommentsSection({
  articleId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [currentUserId, setCurrentUser] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
    fetchCurrentUser();
  }, [articleId]);

   const fetchCurrentUser = async () => {
    try {
      setUserLoading(true);
      const response = await fetch('http://localhost:3000/api/users/current-user', {
        credentials: 'include' // Important pour envoyer les cookies
      });
      
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData.id);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Erreur fetch user:', err);
      setCurrentUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/comments/article/${articleId}`);
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !currentUserId) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
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
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId: number) => {
    if (!replyContent.trim() || !currentUserId) return;

    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      await fetchComments();
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/comments/${commentId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Erreur lors du like');
      await fetchComments();
      
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    if (diffInHours > 0) return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    return 'il y a quelques minutes';
  };

  const buildCommentTree = (comments: Comment[]) => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      const commentNode = commentMap.get(comment.id);
      if (!commentNode) return;

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies?.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(comments);
  const totalCommentsCount = comments.length;

  const toggleComments = () => {
    setCommentsCollapsed(!commentsCollapsed);
  };

  const CommentComponent = ({ comment, level = 0 }: { comment: Comment; level?: number }) => {
    const isOwner = currentUserId === comment.author.id;
    
    return (
      <div className={`${level > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {comment.author.firstName[0]}{comment.author.lastName[0]}
          </div>
          <div className="flex-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {comment.author.firstName} {comment.author.lastName}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {getTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <button
                  onClick={() => handleLike(comment.id)}
                  disabled={!currentUserId}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 disabled:opacity-50"
                >
                  <Heart size={16} className={comment.isLiked ? 'fill-red-500 text-red-500' : ''} />
                  <span>{comment.likes}</span>
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-2 ml-2">
              {currentUserId && (
                <button
                  onClick={() => {
                    if (activeReplyId === comment.id) {
                      setActiveReplyId(null);
                    } else {
                      setActiveReplyId(comment.id);
                      setReplyContent('');
                    }
                  }}
                  className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                >
                  <Reply size={14} />
                  Répondre
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              )}
            </div>

            {activeReplyId === comment.id && currentUserId && (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Répondre à ${comment.author.firstName}...`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleReply(comment.id);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentComponent 
                key={reply.id} 
                comment={reply} 
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{totalCommentsCount} commentaires</span>
          </button>

          <button
            onClick={toggleComments}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
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

      {!commentsCollapsed && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {currentUserId ? 'VO' : '?'}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={currentUserId ? "Partagez votre avis..." : "Connectez-vous pour commenter"}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                    newComment.trim() && !loading && currentUserId
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
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

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400">Chargement des commentaires...</p>
            </div>
          ) : commentTree.length > 0 ? (
            <div className="space-y-4">
              {commentTree.map((comment) => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Soyez le premier à commenter !
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}