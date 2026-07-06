'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CommentFormProps {
  postId: string;
  onComment?: () => void;
}

export default function CommentForm({ postId, onComment }: CommentFormProps) {
  const [content, setContent] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('comments')
        .insert({ user_id: user!.id, post_id: postId, content: text });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent('');
      toast.success('댓글이 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      onComment?.();
    },
    onError: () => toast.error('댓글 등록에 실패했습니다.'),
  });

  if (!user) {
    return (
      <div
        className='rounded-[14px] border px-4 py-3 text-sm text-center'
        style={{ borderColor: '#E8C8BC', color: '#8A6A60', backgroundColor: '#FAF6F2' }}
      >
        댓글을 작성하려면{' '}
        <button
          onClick={() => router.push('/login')}
          className='font-medium underline underline-offset-2'
          style={{ color: '#CC7058' }}
        >
          로그인
        </button>
        이 필요합니다.
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    mutation.mutate(text);
  };

  return (
    <form onSubmit={handleSubmit} className='flex gap-2'>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder='댓글을 입력하세요...'
        rows={2}
        className='flex-1 resize-none rounded-[14px] border px-4 py-3 text-sm outline-none transition-all'
        style={{
          borderColor: '#E8C8BC',
          backgroundColor: '#FAF6F2',
          color: '#3D2820',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e as unknown as React.FormEvent);
        }}
        aria-label='댓글 입력'
      />
      <Button
        type='submit'
        disabled={!content.trim() || mutation.isPending}
        className='self-end rounded-[14px] text-white flex-shrink-0'
        style={{ backgroundColor: '#CC7058' }}
      >
        {mutation.isPending ? '등록 중...' : '등록'}
      </Button>
    </form>
  );
}
