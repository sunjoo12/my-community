'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ImageUploader from '@/components/post/ImageUploader';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이하로 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
});

type FormValues = z.infer<typeof schema>;

export default function WritePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, imageFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { data: post, error } = await supabase
        .from('posts')
        .insert({ user_id: user.id, title: values.title, content: values.content, image_url: imageUrl })
        .select('id')
        .single();

      if (error) throw error;

      toast.success('게시글이 등록되었습니다!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      router.push(`/post?id=${post.id}`);
    } catch {
      toast.error('게시글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='max-w-2xl mx-auto'
    >
      <h1 className='text-2xl font-bold mb-8' style={{ color: '#3D2820' }}>
        새 글 작성
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* 제목 */}
        <div>
          <label
            htmlFor='title'
            className='block text-sm font-medium mb-1.5'
            style={{ color: '#3D2820' }}
          >
            제목 <span className='text-red-400'>*</span>
          </label>
          <input
            id='title'
            {...register('title')}
            placeholder='제목을 입력하세요'
            className='w-full px-4 py-3 rounded-[14px] border text-sm outline-none transition-all'
            style={{
              borderColor: errors.title ? '#CC7058' : '#E8C8BC',
              backgroundColor: '#FAF6F2',
              color: '#3D2820',
            }}
          />
          {errors.title && (
            <p className='text-xs mt-1.5' style={{ color: '#CC7058' }}>
              {errors.title.message}
            </p>
          )}
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className='block text-sm font-medium mb-1.5' style={{ color: '#3D2820' }}>
            사진 업로드
          </label>
          <ImageUploader
            value={imageFile}
            previewUrl={previewUrl}
            onChange={handleImageChange}
          />
        </div>

        {/* 본문 */}
        <div>
          <label
            htmlFor='content'
            className='block text-sm font-medium mb-1.5'
            style={{ color: '#3D2820' }}
          >
            내용 <span className='text-red-400'>*</span>
          </label>
          <textarea
            id='content'
            {...register('content')}
            rows={8}
            placeholder='내용을 입력하세요...'
            className='w-full px-4 py-3 rounded-[14px] border text-sm outline-none resize-none transition-all'
            style={{
              borderColor: errors.content ? '#CC7058' : '#E8C8BC',
              backgroundColor: '#FAF6F2',
              color: '#3D2820',
            }}
          />
          {errors.content && (
            <p className='text-xs mt-1.5' style={{ color: '#CC7058' }}>
              {errors.content.message}
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className='flex gap-3 justify-end pt-2'>
          <Button
            type='button'
            variant='ghost'
            onClick={() => router.back()}
            className='rounded-[14px]'
            style={{ color: '#8A6A60' }}
          >
            취소
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='rounded-[14px] text-white min-w-24'
            style={{ backgroundColor: '#CC7058' }}
          >
            {isSubmitting ? '등록 중...' : '등록'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
