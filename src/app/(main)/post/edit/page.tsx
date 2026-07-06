'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUploader from '@/components/post/ImageUploader';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { Post } from '@/types';

const schema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100),
  content: z.string().min(1, '내용을 입력해주세요.'),
});
type FormValues = z.infer<typeof schema>;

function EditForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formReady, setFormReady] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ['post-edit', id],
    enabled: !!id,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase.from('posts').select('*').eq('id', id!).single();
      return data as Post | null;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (post) {
      reset({ title: post.title, content: post.content });
      setPreviewUrl(post.image_url);
      setFormReady(true);
    }
  }, [post, reset]);

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user || !post) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      let imageUrl = post.image_url;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, imageFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('post-images').getPublicUrl(path);
        imageUrl = data.publicUrl;
      } else if (!previewUrl) {
        imageUrl = null;
      }

      const { error } = await supabase
        .from('posts')
        .update({ title: values.title, content: values.content, image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', post.id);

      if (error) throw error;

      toast.success('게시글이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post-detail', id] });
      router.push(`/post?id=${post.id}`);
    } catch {
      toast.error('수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !formReady) {
    return (
      <div className='max-w-2xl mx-auto space-y-4'>
        <Skeleton className='h-8 w-48' style={{ backgroundColor: '#E8C8BC' }} />
        <Skeleton className='w-full h-12' style={{ backgroundColor: '#E8C8BC' }} />
        <Skeleton className='w-full aspect-video' style={{ backgroundColor: '#E8C8BC' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className='py-20 text-center'>
        <p style={{ color: '#8A6A60' }}>게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='max-w-2xl mx-auto'
    >
      <h1 className='text-2xl font-bold mb-8' style={{ color: '#3D2820' }}>게시글 수정</h1>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium mb-1.5' style={{ color: '#3D2820' }}>
            제목 <span className='text-red-400'>*</span>
          </label>
          <input
            {...register('title')}
            className='w-full px-4 py-3 rounded-[14px] border text-sm outline-none'
            style={{ borderColor: errors.title ? '#CC7058' : '#E8C8BC', backgroundColor: '#FAF6F2', color: '#3D2820' }}
          />
          {errors.title && <p className='text-xs mt-1' style={{ color: '#CC7058' }}>{errors.title.message}</p>}
        </div>

        <div>
          <label className='block text-sm font-medium mb-1.5' style={{ color: '#3D2820' }}>사진</label>
          <ImageUploader value={imageFile} previewUrl={previewUrl} onChange={handleImageChange} />
        </div>

        <div>
          <label className='block text-sm font-medium mb-1.5' style={{ color: '#3D2820' }}>
            내용 <span className='text-red-400'>*</span>
          </label>
          <textarea
            {...register('content')}
            rows={8}
            className='w-full px-4 py-3 rounded-[14px] border text-sm outline-none resize-none'
            style={{ borderColor: errors.content ? '#CC7058' : '#E8C8BC', backgroundColor: '#FAF6F2', color: '#3D2820' }}
          />
          {errors.content && <p className='text-xs mt-1' style={{ color: '#CC7058' }}>{errors.content.message}</p>}
        </div>

        <div className='flex gap-3 justify-end pt-2'>
          <Button type='button' variant='ghost' onClick={() => router.back()} className='rounded-[14px]' style={{ color: '#8A6A60' }}>
            취소
          </Button>
          <Button type='submit' disabled={isSubmitting} className='rounded-[14px] text-white min-w-24' style={{ backgroundColor: '#CC7058' }}>
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={
      <div className='max-w-2xl mx-auto space-y-4'>
        <Skeleton className='h-8 w-48' style={{ backgroundColor: '#E8C8BC' }} />
      </div>
    }>
      <EditForm />
    </Suspense>
  );
}
