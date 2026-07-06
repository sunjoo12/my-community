'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from '@/lib/utils';
import { toast } from 'sonner';
import type { Comment } from '@/types';

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('comments')
        .select('*, profiles:user_id(nickname, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      return (data ?? []) as Comment[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: () => toast.error('삭제에 실패했습니다.'),
  });

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='h-16 rounded-[14px] animate-pulse' style={{ backgroundColor: '#E8C8BC' }} />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className='text-sm text-center py-6' style={{ color: '#8A6A60' }}>
        아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
      </p>
    );
  }

  return (
    <div className='space-y-3'>
      {comments.map((comment) => {
        const profile = Array.isArray(comment.profiles)
          ? comment.profiles[0]
          : comment.profiles;
        const isOwner = user?.id === comment.user_id;

        return (
          <div
            key={comment.id}
            className='flex gap-3 rounded-[14px] border p-4'
            style={{ backgroundColor: '#FAF6F2', borderColor: '#E8C8BC' }}
          >
            <Avatar className='w-8 h-8 flex-shrink-0'>
              <AvatarImage src={profile?.avatar_url ?? ''} />
              <AvatarFallback style={{ backgroundColor: '#96B5B8', color: '#fff', fontSize: 11 }}>
                {profile?.nickname?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <div className='flex items-baseline justify-between gap-2'>
                <span className='text-xs font-semibold' style={{ color: '#3D2820' }}>
                  {profile?.nickname ?? '익명'}
                </span>
                <div className='flex items-center gap-2'>
                  <span className='text-[11px]' style={{ color: '#8A6A60' }}>
                    {formatDistanceToNow(comment.created_at)}
                  </span>
                  {isOwner && (
                    <button
                      onClick={() => deleteMutation.mutate(comment.id)}
                      className='text-red-400 hover:text-red-600 transition-colors'
                      aria-label='댓글 삭제'
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <p className='text-sm mt-1 leading-relaxed' style={{ color: '#5E3C30' }}>
                {comment.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
