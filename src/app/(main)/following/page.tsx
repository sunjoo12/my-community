'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FollowingPage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className='py-24 text-center'>
      <div className='text-5xl mb-4'>🌿</div>
      <p className='text-lg font-medium mb-2' style={{ color: '#3D2820' }}>
        팔로잉 기능 준비 중
      </p>
      <p className='text-sm' style={{ color: '#8A6A60' }}>
        곧 업데이트될 예정이에요!
      </p>
    </div>
  );
}
