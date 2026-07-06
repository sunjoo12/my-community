'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LikeButton from '@/components/like/LikeButton';
import { useAuthStore } from '@/store/authStore';
import type { PostWithCounts } from '@/types';
import { formatDistanceToNow } from '@/lib/utils';

interface PostCardProps {
  post: PostWithCounts;
  likedPostIds: Set<string>;
}

export default function PostCard({ post, likedPostIds }: PostCardProps) {
  const { user } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.03 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Link href={`/post?id=${post.id}`} className='block focus:outline-none focus:ring-2 focus:ring-[#96B5B8] rounded-[20px]'>
        <article
          className='rounded-[20px] overflow-hidden border'
          style={{
            backgroundColor: '#FAF6F2',
            borderColor: '#E8C8BC',
            boxShadow: '0 8px 30px rgba(0,0,0,.06)',
          }}
        >
          {/* 이미지 */}
          <div className='relative w-full aspect-[4/3] bg-[#F0E8E2] overflow-hidden'>
            {post.image_url ? (
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className='object-cover transition-transform duration-500 group-hover:scale-105'
                sizes='(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw'
              />
            ) : (
              <div
                className='w-full h-full flex items-center justify-center text-4xl'
                style={{ background: 'linear-gradient(135deg, #C0B2BC 0%, #F4EDE8 100%)' }}
              >
                🌸
              </div>
            )}
          </div>

          {/* 콘텐츠 */}
          <div className='p-4'>
            <h2
              className='font-semibold text-sm leading-snug line-clamp-2 mb-1.5'
              style={{ color: '#3D2820' }}
            >
              {post.title}
            </h2>
            {post.content && (
              <p
                className='text-xs leading-relaxed line-clamp-2 mb-3'
                style={{ color: '#8A6A60' }}
              >
                {post.content}
              </p>
            )}

            {/* 하단: 작성자 + 액션 */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 min-w-0'>
                <Avatar className='w-6 h-6 flex-shrink-0'>
                  <AvatarImage src={post.avatar_url ?? ''} alt={post.nickname} />
                  <AvatarFallback
                    className='text-[10px]'
                    style={{ backgroundColor: '#96B5B8', color: '#fff' }}
                  >
                    {post.nickname?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <p className='text-xs font-medium truncate' style={{ color: '#5E3C30' }}>
                    {post.nickname}
                  </p>
                  <p className='text-[10px]' style={{ color: '#8A6A60' }}>
                    {formatDistanceToNow(post.created_at)}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3 flex-shrink-0'>
                <LikeButton
                  postId={post.id}
                  initialCount={post.like_count}
                  initialLiked={user ? likedPostIds.has(post.id) : false}
                  queryKeys={[['posts'], ['posts-popular'], ['posts-latest']]}
                />
                <div className='flex items-center gap-1.5'>
                  <MessageCircle size={16} style={{ color: '#8A6A60' }} />
                  <span className='text-sm' style={{ color: '#8A6A60' }}>
                    {post.comment_count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
