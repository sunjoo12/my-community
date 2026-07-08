'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function LogoutPage() {
  const { reset } = useAuthStore();

  useEffect(() => {
    const doLogout = async () => {
      try {
        const supabase = createClient();
        await Promise.race([
          supabase.auth.signOut(),
          new Promise<void>(resolve => setTimeout(resolve, 3000)),
        ]);
      } catch {
        // signOut 실패해도 강제 쿠키 삭제 진행
      }

      // Supabase 세션 쿠키 강제 삭제
      document.cookie.split(';').forEach(c => {
        const key = c.trim().split('=')[0];
        if (key.startsWith('sb-')) {
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });

      reset();
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
      window.location.replace(`${base}/`);
    };

    doLogout();
  }, [reset]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#8A6A60' }}>
      로그아웃 중...
    </div>
  );
}
