'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  autoFocus?: boolean;
  onClose?: () => void;
}

export default function SearchBar({ autoFocus, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className='relative flex items-center w-full'>
      <Search
        size={18}
        className='absolute left-3.5 pointer-events-none'
        style={{ color: '#8A6A60' }}
      />
      <input
        ref={inputRef}
        type='search'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='제목, 내용, 작성자 검색...'
        className='w-full py-2.5 pl-10 pr-10 rounded-2xl border text-sm outline-none transition-all'
        style={{
          backgroundColor: '#FAF6F2',
          borderColor: '#E8C8BC',
          color: '#3D2820',
        }}
        aria-label='검색어 입력'
      />
      {query && (
        <button
          type='button'
          onClick={() => setQuery('')}
          className='absolute right-3.5'
          aria-label='검색어 지우기'
          style={{ color: '#8A6A60' }}
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}
