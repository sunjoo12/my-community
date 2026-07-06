'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import PostCard from '@/components/gallery/PostCard';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import type { PostWithCounts } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const { user } = useAuthStore();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', q],
    enabled: q.length > 0,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts_with_counts')
        .select('*')
        .or(`title.ilike.%${q}%,content.ilike.%${q}%,nickname.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(40);
      return (data ?? []) as PostWithCounts[];
    },
  });

  const { data: likedIds } = useQuery({
    queryKey: ['my-likes', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from('likes').select('post_id').eq('user_id', user!.id);
      return new Set((data ?? []).map((l: { post_id: string }) => l.post_id));
    },
  });

  if (!q) {
    return (
      <div className='py-20 text-center'>
        <p className='text-sm' style={{ color: '#8A6A60' }}>검색어를 입력해주세요.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='rounded-[20px] overflow-hidden border' style={{ borderColor: '#E8C8BC' }}>
            <Skeleton className='w-full aspect-[4/3]' style={{ backgroundColor: '#E8C8BC' }} />
            <div className='p-4 space-y-2'>
              <Skeleton className='h-4 w-3/4' style={{ backgroundColor: '#E8C8BC' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-xl font-bold' style={{ color: '#3D2820' }}>
          "{q}" 검색 결과
        </h1>
        <p className='text-sm mt-1' style={{ color: '#8A6A60' }}>
          {results.length}개의 게시글을 찾았습니다.
        </p>
      </div>

      {results.length === 0 ? (
        <div className='py-20 text-center'>
          <div className='text-4xl mb-3'>🔍</div>
          <p className='text-sm' style={{ color: '#8A6A60' }}>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {results.map((p) => (
            <PostCard key={p.id} post={p} likedPostIds={likedIds ?? new Set()} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className='py-20 text-center text-sm' style={{ color: '#8A6A60' }}>검색 중...</div>}>
      <SearchResults />
    </Suspense>
  );
}
