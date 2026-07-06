'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import LikeButton from '@/components/like/LikeButton';
import CommentList from '@/components/comment/CommentList';
import CommentForm from '@/components/comment/CommentForm';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from '@/lib/utils';
import { toast } from 'sonner';
import type { PostWithCounts } from '@/types';

function PostDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post-detail', id],
    enabled: !!id,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('posts_with_counts')
        .select('*')
        .eq('id', id!)
        .single();
      return data as PostWithCounts | null;
    },
  });

  const { data: liked = false } = useQuery({
    queryKey: ['like-status', id, user?.id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user!.id)
        .eq('post_id', id!)
        .maybeSingle();
      return !!data;
    },
  });

  const { data: commentCount = 0, refetch: refetchCount } = useQuery({
    queryKey: ['comment-count', id],
    enabled: !!id,
    queryFn: async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', id!);
      return count ?? 0;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      if (post?.image_url) {
        const match = post.image_url.match(/\/post-images\/(.+)$/);
        const path = match?.[1];
        if (path) await supabase.storage.from('post-images').remove([path]);
      }
      const { error } = await supabase.from('posts').delete().eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('게시글이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      router.replace('/');
    },
    onError: () => toast.error('삭제에 실패했습니다.'),
  });

  const handleDelete = () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;
    deleteMutation.mutate();
  };

  if (!id) {
    return (
      <div className='py-20 text-center'>
        <p style={{ color: '#8A6A60' }}>잘못된 접근입니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='max-w-2xl mx-auto space-y-4'>
        <Skeleton className='h-8 w-32' style={{ backgroundColor: '#E8C8BC' }} />
        <Skeleton className='w-full aspect-video rounded-[24px]' style={{ backgroundColor: '#E8C8BC' }} />
        <Skeleton className='h-8 w-3/4' style={{ backgroundColor: '#E8C8BC' }} />
        <Skeleton className='h-40 w-full' style={{ backgroundColor: '#E8C8BC' }} />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className='py-20 text-center'>
        <p style={{ color: '#8A6A60' }}>게시글을 불러오지 못했습니다.</p>
      </div>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='max-w-2xl mx-auto'
    >
      <button
        onClick={() => router.back()}
        className='flex items-center gap-1.5 mb-6 text-sm transition-colors hover:opacity-70'
        style={{ color: '#6A9EA4' }}
      >
        <ArrowLeft size={16} />
        돌아가기
      </button>

      <article
        className='rounded-[24px] overflow-hidden border'
        style={{
          backgroundColor: '#FAF6F2',
          borderColor: '#E8C8BC',
          boxShadow: '0 8px 30px rgba(0,0,0,.06)',
        }}
      >
        {post.image_url && (
          <div className='relative w-full aspect-video'>
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className='object-cover'
              priority
              unoptimized
              sizes='(max-width:768px) 100vw, 672px'
            />
          </div>
        )}

        <div className='p-6 sm:p-8'>
          <h1 className='text-2xl font-bold leading-snug mb-4' style={{ color: '#3D2820' }}>
            {post.title}
          </h1>

          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <Avatar className='w-9 h-9'>
                <AvatarImage src={post.avatar_url ?? ''} alt={post.nickname} />
                <AvatarFallback style={{ backgroundColor: '#96B5B8', color: '#fff' }}>
                  {post.nickname?.[0]?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-semibold' style={{ color: '#3D2820' }}>{post.nickname}</p>
                <p className='text-xs' style={{ color: '#8A6A60' }}>{formatDistanceToNow(post.created_at)}</p>
              </div>
            </div>

            {isOwner && (
              <div className='flex gap-2'>
                <Link
                  href={`/post/edit?id=${post.id}`}
                  className='inline-flex items-center gap-1.5 rounded-[14px] px-2.5 py-1 text-sm font-medium transition-colors hover:bg-[#F0E8E2]'
                  style={{ color: '#6A9EA4' }}
                >
                  <Pencil size={14} />
                  수정
                </Link>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className='rounded-[14px] gap-1.5 text-red-400 hover:text-red-600'
                >
                  <Trash2 size={14} />
                  삭제
                </Button>
              </div>
            )}
          </div>

          <div
            className='text-sm leading-relaxed whitespace-pre-wrap mb-8 pb-8 border-b'
            style={{ color: '#5E3C30', borderColor: '#E8C8BC' }}
          >
            {post.content}
          </div>

          <div className='flex items-center gap-4 mb-8'>
            <LikeButton
              postId={post.id}
              initialCount={post.like_count}
              initialLiked={liked}
              queryKeys={[['posts'], ['posts-popular'], ['posts-latest'], ['like-status', id, user?.id ?? '']]}
            />
            <div className='flex items-center gap-1.5'>
              <MessageCircle size={18} style={{ color: '#8A6A60' }} />
              <span className='text-sm' style={{ color: '#8A6A60' }}>{commentCount}</span>
            </div>
          </div>

          <section>
            <h2 className='text-base font-semibold mb-4' style={{ color: '#3D2820' }}>
              댓글 {commentCount > 0 ? commentCount : ''}
            </h2>
            <div className='mb-4'>
              <CommentForm postId={post.id} onComment={() => refetchCount()} />
            </div>
            <CommentList postId={post.id} />
          </section>
        </div>
      </article>
    </motion.div>
  );
}

export default function PostPage() {
  return (
    <Suspense
      fallback={
        <div className='max-w-2xl mx-auto space-y-4'>
          <Skeleton className='h-8 w-32' style={{ backgroundColor: '#E8C8BC' }} />
          <Skeleton className='w-full aspect-video rounded-[24px]' style={{ backgroundColor: '#E8C8BC' }} />
        </div>
      }
    >
      <PostDetail />
    </Suspense>
  );
}
