'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast.success('로그인되었습니다!');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4 login-gradient'>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-sm'
      >
        <div
          className='rounded-[24px] border p-8'
          style={{
            backgroundColor: 'rgba(244, 237, 232, 0.92)',
            backdropFilter: 'blur(16px)',
            borderColor: '#E8C8BC',
            boxShadow: '0 8px 30px rgba(0,0,0,.08)',
          }}
        >
          {/* 로고 */}
          <div className='text-center mb-8'>
            <div
              className='w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold'
              style={{ background: 'linear-gradient(135deg, #96B5B8, #CC7058)' }}
            >
              B
            </div>
            <h1 className='text-xl font-bold' style={{ color: '#3D2820' }}>Blurflower</h1>
            <p className='text-sm mt-1' style={{ color: '#8A6A60' }}>감성 갤러리에 오신 걸 환영해요</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
              <label className='block text-xs font-medium mb-1.5' style={{ color: '#5E3C30' }}>
                이메일
              </label>
              <input
                {...register('email')}
                type='email'
                placeholder='이메일 주소'
                autoComplete='email'
                className='w-full px-4 py-3 rounded-[14px] border text-sm outline-none transition-all'
                style={{ borderColor: errors.email ? '#CC7058' : '#E8C8BC', backgroundColor: '#FAF6F2', color: '#3D2820' }}
              />
              {errors.email && <p className='text-xs mt-1' style={{ color: '#CC7058' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className='block text-xs font-medium mb-1.5' style={{ color: '#5E3C30' }}>
                비밀번호
              </label>
              <div className='relative'>
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder='비밀번호'
                  autoComplete='current-password'
                  className='w-full px-4 py-3 pr-10 rounded-[14px] border text-sm outline-none transition-all'
                  style={{ borderColor: errors.password ? '#CC7058' : '#E8C8BC', backgroundColor: '#FAF6F2', color: '#3D2820' }}
                />
                <button
                  type='button'
                  onClick={() => setShowPw((p) => !p)}
                  className='absolute right-3.5 top-1/2 -translate-y-1/2'
                  style={{ color: '#8A6A60' }}
                  aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className='text-xs mt-1' style={{ color: '#CC7058' }}>{errors.password.message}</p>}
            </div>

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 rounded-[14px] text-white font-medium mt-2'
              style={{ backgroundColor: '#CC7058' }}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <p className='text-center text-sm mt-6' style={{ color: '#8A6A60' }}>
            계정이 없으신가요?{' '}
            <Link href='/signup' className='font-medium underline underline-offset-2' style={{ color: '#CC7058' }}>
              회원가입
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
