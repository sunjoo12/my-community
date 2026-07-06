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

const schema = z
  .object({
    email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
    nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다.').max(20, '닉네임은 20자 이하로 입력해주세요.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
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
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { nickname: values.nickname },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      toast.success('회원가입 완료! 이메일을 확인해주세요.', { duration: 5000 });
      router.push('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('already registered')) {
        toast.error('이미 사용 중인 이메일입니다.');
      } else {
        toast.error('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    borderColor: hasError ? '#CC7058' : '#E8C8BC',
    backgroundColor: '#FAF6F2',
    color: '#3D2820',
  });

  return (
    <div className='min-h-screen flex items-center justify-center px-4 login-gradient py-8'>
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
          <div className='text-center mb-8'>
            <div
              className='w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold'
              style={{ background: 'linear-gradient(135deg, #96B5B8, #CC7058)' }}
            >
              B
            </div>
            <h1 className='text-xl font-bold' style={{ color: '#3D2820' }}>회원가입</h1>
            <p className='text-sm mt-1' style={{ color: '#8A6A60' }}>Blurflower에 함께해요</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {[
              { id: 'email', label: '이메일', type: 'email', placeholder: '이메일 주소', key: 'email' as const },
              { id: 'nickname', label: '닉네임', type: 'text', placeholder: '2~20자', key: 'nickname' as const },
            ].map(({ id, label, type, placeholder, key }) => (
              <div key={id}>
                <label className='block text-xs font-medium mb-1.5' style={{ color: '#5E3C30' }}>{label}</label>
                <input
                  {...register(key)}
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  className='w-full px-4 py-3 rounded-[14px] border text-sm outline-none'
                  style={inputStyle(!!errors[key])}
                />
                {errors[key] && <p className='text-xs mt-1' style={{ color: '#CC7058' }}>{errors[key]?.message}</p>}
              </div>
            ))}

            {(['password', 'passwordConfirm'] as const).map((key) => (
              <div key={key}>
                <label className='block text-xs font-medium mb-1.5' style={{ color: '#5E3C30' }}>
                  {key === 'password' ? '비밀번호' : '비밀번호 확인'}
                </label>
                <div className='relative'>
                  <input
                    {...register(key)}
                    type={showPw ? 'text' : 'password'}
                    placeholder={key === 'password' ? '8자 이상' : '비밀번호 재입력'}
                    className='w-full px-4 py-3 pr-10 rounded-[14px] border text-sm outline-none'
                    style={inputStyle(!!errors[key])}
                  />
                  {key === 'password' && (
                    <button
                      type='button'
                      onClick={() => setShowPw((p) => !p)}
                      className='absolute right-3.5 top-1/2 -translate-y-1/2'
                      style={{ color: '#8A6A60' }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {errors[key] && <p className='text-xs mt-1' style={{ color: '#CC7058' }}>{errors[key]?.message}</p>}
              </div>
            ))}

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full py-3 rounded-[14px] text-white font-medium mt-2'
              style={{ backgroundColor: '#CC7058' }}
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <p className='text-center text-sm mt-6' style={{ color: '#8A6A60' }}>
            이미 계정이 있으신가요?{' '}
            <Link href='/login' className='font-medium underline underline-offset-2' style={{ color: '#CC7058' }}>
              로그인
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
