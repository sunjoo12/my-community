'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';

export default function LogoutPage() {
  const { reset } = useAuthStore();

  useEffect(() => {
    const doLogout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      reset();
      window.location.replace(process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/` : '/');
    };
    doLogout();
  }, [reset]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', color: '#8A6A60' }}>
      로그아웃 중...
    </div>
  );
}
