'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  queryKeys?: string[][];
}

export default function LikeButton({
  postId,
  initialCount,
  initialLiked,
  queryKeys = [],
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [bounce, setBounce] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (nextLiked: boolean) => {
      const supabase = createClient();
      if (nextLiked) {
        await supabase.from('likes').insert({ user_id: user!.id, post_id: postId });
      } else {
        await supabase
          .from('likes')
          .delete()
          .match({ user_id: user!.id, post_id: postId });
      }
    },
    onMutate: (nextLiked) => {
      /* Optimistic Update */
      setLiked(nextLiked);
      setCount((c) => (nextLiked ? c + 1 : c - 1));
      if (nextLiked) {
        setBounce(true);
        setTimeout(() => setBounce(false), 400);
      }
    },
    onError: (_, nextLiked) => {
      /* 롤백 */
      setLiked(!nextLiked);
      setCount((c) => (!nextLiked ? c + 1 : c - 1));
      toast.error('잠시 후 다시 시도해주세요.');
    },
    onSuccess: () => {
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('로그인이 필요한 기능입니다.', {
        action: { label: '로그인', onClick: () => router.push('/login') },
      });
      return;
    }
    mutation.mutate(!liked);
  };

  return (
    <button
      onClick={handleClick}
      className='flex items-center gap-1.5 group'
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      aria-pressed={liked}
    >
      <AnimatePresence mode='wait'>
        <motion.span
          key={liked ? 'liked' : 'unliked'}
          initial={{ scale: 0.8 }}
          animate={{ scale: bounce ? [1, 1.4, 0.9, 1.1, 1] : 1 }}
          transition={{ duration: 0.4 }}
        >
          <Heart
            size={18}
            className='transition-colors duration-200'
            fill={liked ? '#CC7058' : 'none'}
            stroke={liked ? '#CC7058' : '#8A6A60'}
          />
        </motion.span>
      </AnimatePresence>
      <span
        className='text-sm tabular-nums'
        style={{ color: liked ? '#CC7058' : '#8A6A60' }}
      >
        {count}
      </span>
    </button>
  );
}
