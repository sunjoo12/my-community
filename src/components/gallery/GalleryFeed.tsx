'use client';

import { useQuery } from '@tanstack/react-query';
import PostCard from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import type { PostWithCounts } from '@/types';

interface GalleryFeedProps {
  queryKey: string[];
  queryFn: () => Promise<PostWithCounts[]>;
}

function CardSkeleton() {
  return (
    <div className='rounded-[20px] overflow-hidden border' style={{ borderColor: '#E8C8BC' }}>
      <Skeleton className='w-full aspect-[4/3]' style={{ backgroundColor: '#E8C8BC' }} />
      <div className='p-4 space-y-2'>
        <Skeleton className='h-4 w-3/4' style={{ backgroundColor: '#E8C8BC' }} />
        <Skeleton className='h-3 w-full' style={{ backgroundColor: '#E8C8BC' }} />
        <Skeleton className='h-3 w-1/2' style={{ backgroundColor: '#E8C8BC' }} />
      </div>
    </div>
  );
}

export default function GalleryFeed({ queryKey, queryFn }: GalleryFeedProps) {
  const { user } = useAuthStore();

  const { data: posts, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
  });

  const { data: likedIds } = useQuery({
    queryKey: ['my-likes', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user!.id);
      return new Set((data ?? []).map((l: { post_id: string }) => l.post_id));
    },
  });

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className='py-20 text-center'>
        <p className='text-lg mb-2' style={{ color: '#3D2820' }}>
          게시글을 불러오지 못했습니다.
        </p>
        <p className='text-sm' style={{ color: '#8A6A60' }}>
          잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className='py-24 text-center'>
        <div className='text-5xl mb-4'>🌸</div>
        <p className='text-lg font-medium mb-2' style={{ color: '#3D2820' }}>
          아직 게시글이 없습니다
        </p>
        <p className='text-sm' style={{ color: '#8A6A60' }}>
          첫 번째 게시글을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4'>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          likedPostIds={likedIds ?? new Set()}
        />
      ))}
    </div>
  );
}
