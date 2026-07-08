'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from '@/components/notification/NotificationDropdown';
import SearchBar from '@/components/search/SearchBar';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, profile } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className='fixed top-0 left-0 right-0 z-50 transition-all duration-300'
        style={{
          backgroundColor: isScrolled
            ? 'rgba(244, 237, 232, 0.85)'
            : 'rgba(244, 237, 232, 0.95)',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          boxShadow: isScrolled ? '0 2px 20px rgba(61, 40, 32, 0.08)' : 'none',
          borderBottom: isScrolled ? '1px solid #E8C8BC' : '1px solid transparent',
        }}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4'>
          {/* 로고 */}
          <Link href='/' className='flex items-center gap-2 flex-shrink-0'>
            <div
              className='w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold'
              style={{ background: 'linear-gradient(135deg, #96B5B8, #CC7058)' }}
            >
              B
            </div>
            <span
              className='text-lg font-bold hidden sm:block'
              style={{ color: '#3D2820', letterSpacing: '-0.02em' }}
            >
              Blurflower
            </span>
          </Link>

          {/* 우측 액션 */}
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowSearch((p) => !p)}
              className='p-2 rounded-full hover:bg-[#E8C8BC]/50 transition-colors'
              aria-label='검색'
              style={{ color: '#5E3C30' }}
            >
              <Search size={20} />
            </button>

            {user ? (
              <>
                <Link href='/post/write'>
                  <Button
                    size='sm'
                    className='hidden sm:flex gap-1.5 rounded-2xl text-white'
                    style={{ backgroundColor: '#CC7058' }}
                  >
                    <Edit3 size={14} />
                    작성
                  </Button>
                </Link>

                <NotificationDropdown />

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className='rounded-full focus:outline-none focus:ring-2 focus:ring-[#96B5B8]'
                    aria-label='사용자 메뉴'
                  >
                    <Avatar className='w-8 h-8'>
                      <AvatarImage src={profile?.avatar_url ?? ''} alt={profile?.nickname} />
                      <AvatarFallback style={{ backgroundColor: '#96B5B8', color: '#fff' }}>
                        {profile?.nickname?.[0]?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-44'>
                    <DropdownMenuItem>
                      <Link href='/mypage' className='w-full'>마이페이지</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href='/post/write' className='w-full'>새 글 작성</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-red-500 p-0'>
                      <Link href='/logout' className='block w-full px-1.5 py-1'>
                        로그아웃
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className='flex items-center gap-2'>
                <Link href='/login'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='rounded-2xl'
                    style={{ color: '#5E3C30' }}
                  >
                    로그인
                  </Button>
                </Link>
                <Link href='/signup'>
                  <Button
                    size='sm'
                    className='rounded-2xl text-white'
                    style={{ backgroundColor: '#CC7058' }}
                  >
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 검색바 드롭다운 */}
      {showSearch && (
        <div
          className='fixed top-16 left-0 right-0 z-40 px-4 py-3 border-b'
          style={{ backgroundColor: '#F4EDE8', borderColor: '#E8C8BC' }}
        >
          <div className='max-w-2xl mx-auto'>
            <SearchBar autoFocus onClose={() => setShowSearch(false)} />
          </div>
        </div>
      )}
    </>
  );
}
