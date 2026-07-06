'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Popular', href: '/popular' },
  { label: 'Latest', href: '/latest' },
  { label: 'Following', href: '/following' },
  { label: 'My Page', href: '/mypage' },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className='sticky top-16 z-40 border-b'
      style={{ backgroundColor: '#F4EDE8', borderColor: '#E8C8BC' }}
      aria-label='메인 네비게이션'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6'>
        <ul className='flex gap-1 overflow-x-auto scrollbar-none' role='list'>
          {NAV_ITEMS.map(({ label, href }) => (
            <li key={href} className='flex-shrink-0'>
              <Link
                href={href}
                className='relative flex items-center px-4 py-3.5 text-sm font-medium transition-colors duration-200'
                style={{
                  color: isActive(href) ? '#3D2820' : '#8A6A60',
                  fontWeight: isActive(href) ? 600 : 400,
                }}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {label}
                {isActive(href) && (
                  <span
                    className='absolute bottom-0 left-0 right-0 h-0.5 rounded-full'
                    style={{ backgroundColor: '#CC7058' }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
