'use client';

import { createClient } from '@/lib/supabase/client';
import GalleryFeed from '@/components/gallery/GalleryFeed';
import type { PostWithCounts } from '@/types';

export default function HomePage() {
  const queryFn = async (): Promise<PostWithCounts[]> => {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts_with_counts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(40);
    return (data ?? []) as PostWithCounts[];
  };

  return <GalleryFeed queryKey={['posts']} queryFn={queryFn} />;
}
