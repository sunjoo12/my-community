'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function LogoutPage() {
  const { reset } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // signOut은 백그라운드에서 실행 (API 토큰 무효화)
    const supabase = createClient();
    supabase.auth.signOut().catch(() => {});

    // 즉시 쿠키 삭제
    document.cookie.split(';').forEach(c => {
      const key = c.trim().split('=')[0];
      if (key.startsWith('sb-')) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });

    // 스토어 초기화
    reset();

    // 홈으로 리다이렉트 (basePath 자동 적용됨)
    router.replace('/');
  }, [reset, router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#8A6A60' }}>
      로그아웃 중...
    </div>
  );
}
