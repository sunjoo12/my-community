'use client';

import { createClient } from '@/lib/supabase/client';
import GalleryFeed from '@/components/gallery/GalleryFeed';
import type { PostWithCounts } from '@/types';

export default function PopularPage() {
  const queryFn = async (): Promise<PostWithCounts[]> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts_with_counts')
      .select('*')
      .order('like_count', { ascending: false })
      .limit(40);
    return (data ?? []) as PostWithCounts[];
  };

  return (
    <div>
      <div className='mb-4'>
        <h1 className='text-xl font-bold' style={{ color: '#3D2820' }}>
          인기 게시글
        </h1>
        <p className='text-sm mt-1' style={{ color: '#8A6A60' }}>
          좋아요가 많은 게시글을 모아봤어요
        </p>
      </div>
      <GalleryFeed queryKey={['posts-popular']} queryFn={queryFn} />
    </div>
  );
}
