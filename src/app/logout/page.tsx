'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function LogoutPage() {
  const reset = useAuthStore(s => s.reset);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.signOut().catch(() => {});

    // sb- 쿠키 즉시 삭제
    document.cookie.split(';').forEach(c => {
      const key = c.trim().split('=')[0];
      if (key.startsWith('sb-')) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });

    reset();

    // /logout/ → /  로 치환해서 사이트 홈으로 이동
    const home = window.location.href.replace(/\/logout\/?$/, '/');
    window.location.replace(home);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#8A6A60' }}>
      로그아웃 중...
    </div>
  );
}
