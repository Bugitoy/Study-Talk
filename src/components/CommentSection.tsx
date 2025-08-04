'use client';
import { useState, useEffect } from 'react';
import { User as UserIcon, Send, Reply } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // React Query for comments with aggressive caching
  const { data: comments = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['comments', confessionId],
    queryFn: async () => {
      const response = await fetch(`/api/confessions/${confessionId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: isVisible, // Only fetch when visible
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Optimistic comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/confessions/${confessionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          authorId: user?.id,
          isAnonymous: false,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit comment');
      return response.json();
    },
    onMutate: async (content) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', confessionId] });
      
      // Snapshot previous value
      const previousComments = queryClient.getQueryData(['comments', confessionId]);
      
      // Optimistically update
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content: content.trim(),
        authorId: user?.id,
        isAnonymous: false,
        createdAt: new Date().toISOString(),
        author: {
          id: user?.id,
          name: user?.name,
          image: user?.image,
        },
        replies: [],
      };
      
      queryClient.setQueryData(['comments', confessionId], (old: any) => [optimisticComment, ...(old || [])]);
      
      return { previousComments };
    },
    onError: (err, content, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', confessionId], context.previousComments);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['comments', confessionId] });
    },
    onSuccess: () => {
      setNewComment('');
      updateCommentCount(confessionId, comments.length + 1);
    },
  });

  // Optimistic reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId: string }) => {
      const response = await fetch(`/api/confessions/${confessionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          authorId: user?.id,
          isAnonymous: false,
          parentId,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit reply');
      return response.json();
    },
    onMutate: async ({ content, parentId }) => {
      await queryClient.cancelQueries({ queryKey: ['comments', confessionId] });
      
      const previousComments = queryClient.getQueryData(['comments', confessionId]);
      
      const optimisticReply = {
        id: `temp-reply-${Date.now()}`,
        content: content.trim(),
        authorId: user?.id,
        isAnonymous: false,
        parentId,
        createdAt: new Date().toISOString(),
        author: {
          id: user?.id,
          name: user?.name,
          image: user?.image,
        },
      };
      
      queryClient.setQueryData(['comments', confessionId], (old: any) => 
        old?.map((comment: any) => 
          comment.id === parentId 
            ? { ...comment, replies: [...(comment.replies || []), optimisticReply] }
            : comment
        )
      );
      
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', confessionId], context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', confessionId] });
    },
    onSuccess: () => {
      setReplyContent('');
      setReplyingTo(null);
      const totalComments = comments.reduce((acc: number, c: any) => acc + 1 + (c.replies?.length || 0), 0) + 1;
      updateCommentCount(confessionId, totalComments);
    },
  });

  const handleSubmitComment = () => {
    if (!user?.id || !newComment.trim()) return;

    if (newComment.trim().length > 1000) {
      alert('Comment too long (max 1000 characters)');
      return;
    }

    commentMutation.mutate(newComment);
  };

  const handleSubmitReply = (parentId: string) => {
    if (!user?.id || !replyContent.trim()) return;

    if (replyContent.trim().length > 1000) {
      alert('Reply too long (max 1000 characters)');
      return;
    }

    replyMutation.mutate({ content: replyContent, parentId });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    refetch();
  }, [isVisible, confessionId, refetch]);

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
                className="flex-1 min-h-[36px] max-h-[120px] resize-none border-gray-300 focus:border-gray-400 text-black text-[10px] sm:text-sm"
                rows={1}
                                 disabled={commentMutation.isPending}
                maxLength={1000}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={commentMutation.isPending || !newComment.trim()}
                className="ml-2 px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-300 transition-colors"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center text-gray-500 text-xs sm:text-sm">
            <span>Please log in to comment.</span>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-1 text-gray-500 text-xs sm:text-sm">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-1 text-gray-500 text-xs sm:text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: Comment) => (
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
                      <span className="font-semibold text-xs sm:text-sm text-gray-800">
                        {comment.isAnonymous ? 'Anonymous' : comment.author?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-line text-xs sm:text-sm">{comment.content}</p>
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="mt-2 text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Reply className="w-3 h-3" />
                      <span className="hidden sm:inline">Reply</span>
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
                      className="flex-1 min-h-[32px] max-h-[80px] resize-none border-gray-300 focus:border-gray-400 text-black text-[10px] sm:text-sm"
                      rows={1}
                                             disabled={replyMutation.isPending}
                      maxLength={1000}
                    />
                    <Button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={replyMutation.isPending || !replyContent.trim()}
                      className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-11 space-y-3">
                    {comment.replies.map((reply: Comment) => (
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
                            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line">{reply.content}</p>
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