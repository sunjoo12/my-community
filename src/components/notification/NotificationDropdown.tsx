'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import type { Notification } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from '@/lib/utils';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('notifications')
        .select('*, actor:actor_id(nickname, avatar_url), post:post_id(title, image_url)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      return (data ?? []) as Notification[];
    },
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const getLabel = (n: Notification) => {
    const actor = Array.isArray(n.actor) ? n.actor[0] : n.actor;
    const name = actor?.nickname ?? '누군가';
    if (n.type === 'like') return `${name}님이 게시글에 좋아요를 눌렀습니다.`;
    return `${name}님이 댓글을 남겼습니다.`;
  };

  if (!user) return null;

  return (
    <div className='relative'>
      <button
        onClick={() => {
          setOpen((p) => !p);
          if (!open && unreadCount > 0) markAllRead.mutate();
        }}
        className='relative p-2 rounded-full hover:bg-[#E8C8BC]/50 transition-colors'
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 미읽음)` : ''}`}
        style={{ color: '#5E3C30' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className='absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold'
            style={{ backgroundColor: '#CC7058' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className='fixed inset-0 z-40' onClick={() => setOpen(false)} />
          <div
            className='absolute right-0 top-12 z-50 w-80 rounded-2xl border shadow-lg overflow-hidden'
            style={{
              backgroundColor: '#FAF6F2',
              borderColor: '#E8C8BC',
              boxShadow: '0 8px 30px rgba(0,0,0,.08)',
            }}
          >
            <div
              className='px-4 py-3 border-b flex items-center justify-between'
              style={{ borderColor: '#E8C8BC' }}
            >
              <span className='font-semibold text-sm' style={{ color: '#3D2820' }}>
                알림
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className='text-xs'
                  style={{ color: '#6A9EA4' }}
                >
                  모두 읽음
                </button>
              )}
            </div>

            <div className='max-h-80 overflow-y-auto'>
              {notifications.length === 0 ? (
                <div className='py-10 text-center text-sm' style={{ color: '#8A6A60' }}>
                  알림이 없습니다
                </div>
              ) : (
                notifications.map((n) => {
                  const actor = Array.isArray(n.actor) ? n.actor[0] : n.actor;
                  return (
                    <div
                      key={n.id}
                      className='flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-[#F0E8E2]'
                      style={{
                        borderColor: '#E8C8BC',
                        backgroundColor: n.is_read ? undefined : '#FFF3EE',
                      }}
                    >
                      <Avatar className='w-8 h-8 flex-shrink-0'>
                        <AvatarImage src={actor?.avatar_url ?? ''} />
                        <AvatarFallback style={{ backgroundColor: '#96B5B8', color: '#fff', fontSize: 12 }}>
                          {actor?.nickname?.[0]?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0'>
                        <p className='text-xs leading-5' style={{ color: '#3D2820' }}>
                          {getLabel(n)}
                        </p>
                        <p className='text-[11px] mt-0.5' style={{ color: '#8A6A60' }}>
                          {formatDistanceToNow(n.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
