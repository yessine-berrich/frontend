// components/comments/CommentsSection.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  ChevronUp, 
  ChevronDown, 
  Heart, 
  MoreHorizontal, 
  MessageCircleReply
} from 'lucide-react';

interface Comment {
  id: string;
  author: {
    name: string;
    initials: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  createdAt: string;
  isLiked?: boolean;
}

interface CommentsSectionProps {
  articleId: string;
  initialComments?: Comment[];
  commentsCount: number;
  onAddComment?: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
}

export default function CommentsSection({
  articleId,
  initialComments = [],
  commentsCount,
  onAddComment,
  onLikeComment
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [commentsCollapsed, setCommentsCollapsed] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Focus comment input when comments are expanded
  useEffect(() => {
    if (!commentsCollapsed && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [commentsCollapsed]);

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: { name: 'Vous', initials: 'VO' },
      content: newComment.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
    };
    
    const updatedComments = [newCommentObj, ...comments];
    setComments(updatedComments);
    setNewComment('');
    
    // Call parent callback
    onAddComment?.(newComment.trim());
    
    // Scroll to show the new comment
    setTimeout(() => {
      if (commentsSectionRef.current) {
        const firstComment = commentsSectionRef.current.querySelector('.comment-item');
        firstComment?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const newLikes = comment.isLiked ? comment.likes - 1 : comment.likes + 1;
        const updatedComment = { 
          ...comment, 
          likes: newLikes, 
          isLiked: !comment.isLiked 
        };
        
        // Call parent callback
        onLikeComment?.(commentId);
        
        return updatedComment;
      }
      return comment;
    }));
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
      return `il y a environ ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
    } else if (diffInDays > 0) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return 'il y a quelques minutes';
    }
  };

  const totalCommentsCount = comments.length + commentsCount;

  return (
    <>
      {/* Comments Section Container */}
      <div 
        ref={commentsSectionRef}
        className={`border-t border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          commentsCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[500px] opacity-100'
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
            >
              <ChevronUp size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Add Comment Form */}
          <div className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                VO
              </div>
              <div className="flex-1 relative">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Partagez votre avis sur cet article..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    newComment.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  isActive={activeCommentId === comment.id}
                  onLike={() => handleLikeComment(comment.id)}
                  onToggleActive={() => setActiveCommentId(
                    activeCommentId === comment.id ? null : comment.id
                  )}
                  getTimeAgo={getTimeAgo}
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

          {/* Load More Comments */}
          {comments.length > 3 && (
            <div className="mt-8 text-center">
              <button className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                Voir tous les commentaires ({totalCommentsCount})
              </button>
            </div>
          )}
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
  isActive: boolean;
  onLike: () => void;
  onToggleActive: () => void;
  getTimeAgo: (dateString: string) => string;
}

function CommentItem({ 
  comment, 
  isActive, 
  onLike, 
  onToggleActive,
  getTimeAgo 
}: CommentItemProps) {
  return (
    <div className="comment-item group">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {comment.author.initials}
        </div>
        <div className="flex-1">
          <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-all ${
            isActive ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {comment.author.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getTimeAgo(comment.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onLike}
                  className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Heart
                    size={20}
                    className={comment.isLiked ? 'fill-red-500 text-red-500' : ''}
                  />
                  <span>{comment.likes}</span>
                </button>
               <button
                    onClick={onToggleActive}
                    className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                 >
                    <MessageCircleReply size={20} />
               </button>

              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {comment.content}
            </p>
          </div>
          
          {/* Reply Input (appears when comment is active) */}
          {isActive && (
            <div className="mt-3 ml-10">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Répondre à ce commentaire..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onToggleActive();
                    }
                  }}
                />
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  Répondre
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}