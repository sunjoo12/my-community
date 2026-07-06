'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const code = new URLSearchParams(window.location.search).get('code');

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.replace('/login?error=callback_failed');
        } else {
          router.replace('/');
        }
      });
    } else {
      /* Supabase가 세션을 자동으로 감지한 경우 */
      supabase.auth.getSession().then(({ data: { session } }) => {
        router.replace(session ? '/' : '/login');
      });
    }
  }, [router]);

  return (
    <div className='min-h-screen flex items-center justify-center' style={{ backgroundColor: '#F4EDE8' }}>
      <div className='text-center'>
        <div
          className='w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold animate-pulse'
          style={{ background: 'linear-gradient(135deg, #96B5B8, #CC7058)' }}
        >
          B
        </div>
        <p className='text-sm' style={{ color: '#8A6A60' }}>인증 처리 중...</p>
      </div>
    </div>
  );
}
