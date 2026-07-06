'use client';

import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const schema = z.object({
  nickname: z.string().min(2, '2자 이상 입력해주세요.').max(20, '20자 이하로 입력해주세요.'),
  bio: z.string().max(160, '160자 이하로 입력해주세요.').optional(),
});
type FormValues = z.infer<typeof schema>;

interface ProfileEditFormProps {
  onClose: () => void;
}

export default function ProfileEditForm({ onClose }: ProfileEditFormProps) {
  const { user, profile, setProfile } = useAuthStore();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nickname: profile?.nickname ?? '', bio: profile?.bio ?? '' },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      let avatar_url = profile?.avatar_url ?? null;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        avatar_url = `${data.publicUrl}?t=${Date.now()}`;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          nickname: values.nickname,
          bio: values.bio ?? '',
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('프로필이 업데이트되었습니다.');
      onClose();
    } catch {
      toast.error('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className='rounded-[24px] border p-6 sm:p-8 mb-8'
      style={{ backgroundColor: '#FAF6F2', borderColor: '#E8C8BC', boxShadow: '0 8px 30px rgba(0,0,0,.06)' }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-lg font-bold' style={{ color: '#3D2820' }}>프로필 수정</h2>
        <button onClick={onClose} style={{ color: '#8A6A60' }}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        {/* 아바타 */}
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <Avatar className='w-20 h-20'>
              <AvatarImage src={avatarPreview ?? ''} />
              <AvatarFallback style={{ backgroundColor: '#96B5B8', color: '#fff', fontSize: 28 }}>
                {profile?.nickname?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              type='button'
              onClick={() => fileRef.current?.click()}
              className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white'
              style={{ backgroundColor: '#CC7058' }}
              aria-label='프로필 사진 변경'
            >
              <Camera size={13} />
            </button>
          </div>
          <div>
            <p className='text-sm font-medium' style={{ color: '#3D2820' }}>프로필 사진</p>
            <p className='text-xs mt-0.5' style={{ color: '#8A6A60' }}>JPG, PNG, WebP · 최대 2MB</p>
          </div>
          <input
            ref={fileRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            onChange={handleAvatarChange}
            className='hidden'
          />
        </div>

        {/* 닉네임 */}
        <div>
          <label className='block text-xs font-medium mb-1.5' style={{ color: '#5E3C30' }}>닉네임</label>
          <input
            {...register('nickname')}
            className='w-full px-4 py-3 rounded-[14px] border text-sm outline-none'
            style={{ borderColor: errors.nickname ? '#CC7058' : '#E8C8BC', backgroundColor: '#F4EDE8', color: '#3D2820' }}
          />
          {errors.nickname && <p className='text-xs mt-1' style={{ color: '#CC7058' }}>{errors.nickname.message}</p>}
        </div>

        {/* 소개 */}
        <div>
          <label className='block text-xs font-medium mb-1.5' style={{ color: '#5E3C30' }}>소개</label>
          <textarea
            {...register('bio')}
            rows={3}
            placeholder='자기소개를 입력해주세요 (최대 160자)'
            className='w-full px-4 py-3 rounded-[14px] border text-sm outline-none resize-none'
            style={{ borderColor: '#E8C8BC', backgroundColor: '#F4EDE8', color: '#3D2820' }}
          />
          {errors.bio && <p className='text-xs mt-1' style={{ color: '#CC7058' }}>{errors.bio.message}</p>}
        </div>

        <div className='flex gap-3 justify-end'>
          <Button type='button' variant='ghost' onClick={onClose} className='rounded-[14px]' style={{ color: '#8A6A60' }}>
            취소
          </Button>
          <Button type='submit' disabled={isLoading} className='rounded-[14px] text-white' style={{ backgroundColor: '#CC7058' }}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
