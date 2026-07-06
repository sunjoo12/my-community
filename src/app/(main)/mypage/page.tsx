'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase/client';
import PostCard from '@/components/gallery/PostCard';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import type { PostWithCounts } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyPage() {
  const { user, profile, isLoading: authLoading } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const { data: myPosts = [] } = useQuery({
    queryKey: ['my-posts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts_with_counts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      return (data ?? []) as PostWithCounts[];
    },
  });

  const { data: likedPosts = [] } = useQuery({
    queryKey: ['my-liked-posts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const supabase = createClient();
      const { data: likesData } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (!likesData || likesData.length === 0) return [];

      const postIds = likesData.map((l: { post_id: string }) => l.post_id);
      const { data } = await supabase
        .from('posts_with_counts')
        .select('*')
        .in('id', postIds);

      return (data ?? []) as PostWithCounts[];
    },
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

  if (authLoading || !user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='max-w-5xl mx-auto'
    >
      {/* 프로필 헤더 */}
      {editMode ? (
        <ProfileEditForm onClose={() => setEditMode(false)} />
      ) : (
        <div
          className='rounded-[24px] border p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6'
          style={{ backgroundColor: '#FAF6F2', borderColor: '#E8C8BC', boxShadow: '0 8px 30px rgba(0,0,0,.06)' }}
        >
          <div className='relative'>
            <Avatar className='w-20 h-20 sm:w-24 sm:h-24'>
              <AvatarImage src={profile?.avatar_url ?? ''} alt={profile?.nickname} />
              <AvatarFallback
                className='text-2xl'
                style={{ backgroundColor: '#96B5B8', color: '#fff' }}
              >
                {profile?.nickname?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className='flex-1 text-center sm:text-left'>
            <h1 className='text-xl font-bold mb-1' style={{ color: '#3D2820' }}>
              {profile?.nickname ?? '사용자'}
            </h1>
            <p className='text-sm mb-1' style={{ color: '#8A6A60' }}>{profile?.email}</p>
            {profile?.bio && (
              <p className='text-sm mt-2 leading-relaxed' style={{ color: '#5E3C30' }}>{profile.bio}</p>
            )}
            <div className='flex items-center gap-4 mt-3 justify-center sm:justify-start'>
              <span className='text-sm' style={{ color: '#8A6A60' }}>
                게시글 <strong style={{ color: '#3D2820' }}>{myPosts.length}</strong>
              </span>
              <span className='text-sm' style={{ color: '#8A6A60' }}>
                좋아요 <strong style={{ color: '#3D2820' }}>{likedPosts.length}</strong>
              </span>
            </div>
          </div>

          <Button
            variant='ghost'
            size='sm'
            onClick={() => setEditMode(true)}
            className='gap-1.5 rounded-[14px]'
            style={{ color: '#6A9EA4' }}
          >
            <Settings size={15} />
            프로필 수정
          </Button>
        </div>
      )}

      {/* 탭 */}
      <Tabs defaultValue='my-posts'>
        <TabsList className='mb-6' style={{ backgroundColor: '#F0E8E2' }}>
          <TabsTrigger value='my-posts' style={{ color: '#5E3C30' }}>
            내 게시글 ({myPosts.length})
          </TabsTrigger>
          <TabsTrigger value='liked' style={{ color: '#5E3C30' }}>
            좋아요한 글 ({likedPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='my-posts'>
          {myPosts.length === 0 ? (
            <div className='py-20 text-center'>
              <div className='text-4xl mb-3'>🌸</div>
              <p className='text-sm' style={{ color: '#8A6A60' }}>아직 작성한 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {myPosts.map((p) => (
                <PostCard key={p.id} post={p} likedPostIds={likedIds ?? new Set()} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value='liked'>
          {likedPosts.length === 0 ? (
            <div className='py-20 text-center'>
              <div className='text-4xl mb-3'>💝</div>
              <p className='text-sm' style={{ color: '#8A6A60' }}>좋아요한 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {likedPosts.map((p) => (
                <PostCard key={p.id} post={p} likedPostIds={likedIds ?? new Set()} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
