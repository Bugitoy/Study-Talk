'use client';
import { useState, useEffect } from 'react';
import { User as UserIcon, Send, Reply } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  isAnonymous: boolean;
  parentId?: string;
  createdAt: string;
  author: {
    id: string;
    name?: string;
    image?: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  confessionId: string;
  isVisible: boolean;
  onClose?: () => void;
  updateCommentCount: (confessionId: string, newCount: number) => void;
  user?: any;
}

export function CommentSection({ confessionId, isVisible, onClose, updateCommentCount, user }: CommentSectionProps) {
  const { user: kindeUser } = useKindeBrowserClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!isVisible) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/confessions/${confessionId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user?.id || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/confessions/${confessionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          authorId: user.id,
          isAnonymous: false,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        updateCommentCount(confessionId, comments.length + 1);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user?.id || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/confessions/${confessionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim(),
          authorId: user.id,
          isAnonymous: false,
          parentId,
        }),
      });

      if (response.ok) {
        const newReply = await response.json();
        setComments(prev =>
          prev.map(comment =>
            comment.id === parentId
              ? { ...comment, replies: [...(comment.replies || []), newReply] }
              : comment
          )
        );
        setReplyContent('');
        setReplyingTo(null);
        // Note: A reply also increases the total comment count
        const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) + 1;
        updateCommentCount(confessionId, totalComments);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchComments();
  }, [isVisible, confessionId]);

  if (!isVisible) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4 lg:p-6 mt-6 rounded-b-[12px]">
      <div className="space-y-4">
        {/* Comment Input */}
        {user ? (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              {user.picture ? (
                <Image
                  src={user.picture}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full w-8 h-8 object-cover"
                />
              ) : (
                <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                </span>
              )}
              <Textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 min-h-[36px] max-h-[120px] resize-none border-gray-300 focus:border-blue-400"
                rows={1}
                disabled={submitting}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center text-gray-500">
            <span>Please log in to comment.</span>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-1 text-gray-500">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-1 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                {/* Main Comment */}
                <div className="flex items-start gap-3">
                  {comment.author?.image && !comment.isAnonymous ? (
                    <Image
                      src={comment.author.image}
                      alt={comment.author.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">
                        {comment.isAnonymous ? 'Anonymous' : comment.author?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Reply className="w-3 h-3" />
                      Reply
                    </button>
                  </div>
                </div>

                {/* Reply Input */}
                {user && replyingTo === comment.id && (
                  <div className="flex items-center gap-2 mt-2">
                    <Textarea
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 min-h-[32px] max-h-[80px] resize-none border-gray-300 focus:border-blue-400"
                      rows={1}
                      disabled={submitting}
                    />
                    <Button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={submitting || !replyContent.trim()}
                      className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-11 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start gap-3">
                          {reply.author?.image && !reply.isAnonymous ? (
                            <Image
                              src={reply.author.image}
                              alt={reply.author.name || "User"}
                              width={24}
                              height={24}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <UserIcon className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs text-gray-800">
                                {reply.isAnonymous ? 'Anonymous' : reply.author?.name || 'Unknown'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 