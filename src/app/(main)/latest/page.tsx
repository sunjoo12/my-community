'use client';

import { createClient } from '@/lib/supabase/client';
import GalleryFeed from '@/components/gallery/GalleryFeed';
import type { PostWithCounts } from '@/types';

export default function LatestPage() {
  const queryFn = async (): Promise<PostWithCounts[]> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts_with_counts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(40);
    return (data ?? []) as PostWithCounts[];
  };

  return (
    <div>
      <div className='mb-4'>
        <h1 className='text-xl font-bold' style={{ color: '#3D2820' }}>
          최신 게시글
        </h1>
        <p className='text-sm mt-1' style={{ color: '#8A6A60' }}>
          방금 올라온 따끈한 게시글이에요
        </p>
      </div>
      <GalleryFeed queryKey={['posts-latest']} queryFn={queryFn} />
    </div>
  );
}
