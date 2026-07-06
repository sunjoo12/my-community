'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const KEYWORDS = ['# 일상', '# 힐링', '# 감정공유', '# 사진일기', '# 소소한행복'];

export default function HeroBanner() {
  const { user } = useAuthStore();

  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className='relative w-full overflow-hidden rounded-[28px] mb-6'
      style={{
        background: 'linear-gradient(135deg, #B8D0D4 0%, #F4EDE8 45%, #E0B8B0 100%)',
        minHeight: '220px',
      }}
    >
      {/* 배경 장식 원 */}
      <div
        className='absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-20'
        style={{ background: 'radial-gradient(circle, #96B5B8, transparent)' }}
      />
      <div
        className='absolute -bottom-10 -left-10 w-44 h-44 rounded-full opacity-15'
        style={{ background: 'radial-gradient(circle, #CC7058, transparent)' }}
      />
      <div
        className='absolute top-6 right-1/4 w-20 h-20 rounded-full opacity-10'
        style={{ background: 'radial-gradient(circle, #D4A060, transparent)' }}
      />

      {/* 떠다니는 꽃 장식 */}
      <motion.span
        className='absolute text-3xl select-none pointer-events-none'
        style={{ top: '18px', right: '60px', opacity: 0.55 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        🌸
      </motion.span>
      <motion.span
        className='absolute text-xl select-none pointer-events-none'
        style={{ bottom: '24px', right: '120px', opacity: 0.45 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        🌿
      </motion.span>
      <motion.span
        className='absolute text-2xl select-none pointer-events-none hidden sm:block'
        style={{ top: '50%', right: '32px', opacity: 0.35 }}
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >
        ✨
      </motion.span>

      {/* 콘텐츠 */}
      <div className='relative z-10 px-7 py-8 sm:px-10 sm:py-10 flex flex-col gap-4'>
        {/* 태그 */}
        <motion.div
          className='flex flex-wrap gap-2'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {KEYWORDS.map((kw, i) => (
            <span
              key={kw}
              className='text-xs font-semibold px-3 py-1 rounded-full'
              style={{
                backgroundColor: i % 2 === 0
                  ? 'rgba(150, 181, 184, 0.35)'
                  : 'rgba(204, 112, 88, 0.2)',
                color: i % 2 === 0 ? '#3A7A82' : '#A04A38',
                border: `1px solid ${i % 2 === 0 ? 'rgba(150,181,184,0.4)' : 'rgba(204,112,88,0.25)'}`,
                backdropFilter: 'blur(4px)',
              }}
            >
              {kw}
            </span>
          ))}
        </motion.div>

        {/* 헤드라인 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          <h1
            className='text-2xl sm:text-3xl font-bold leading-snug'
            style={{ color: '#3D2820', letterSpacing: '-0.02em' }}
          >
            Blooming like a Flower,<br className='hidden sm:block' /> with your story
          </h1>
          <p
            className='mt-2 text-sm sm:text-base leading-relaxed max-w-md'
            style={{ color: '#6A4A40' }}
          >
            소소한 일상, 잠깐의 힐링, 그리고 마음 속 이야기를<br className='hidden sm:block' />
            Blurflower에서 함께 나눠요.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          className='flex items-center gap-3 mt-1'
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          {user ? (
            <Link
              href='/post/write'
              className='inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-[0.97]'
              style={{ backgroundColor: '#CC7058', boxShadow: '0 4px 14px rgba(204,112,88,0.35)' }}
            >
              글 남기기
            </Link>
          ) : (
            <>
              <Link
                href='/signup'
                className='inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-[0.97]'
                style={{ backgroundColor: '#CC7058', boxShadow: '0 4px 14px rgba(204,112,88,0.35)' }}
              >
                지금 시작하기
              </Link>
              <Link
                href='/login'
                className='inline-flex items-center px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]'
                style={{
                  backgroundColor: 'rgba(255,255,255,0.55)',
                  color: '#5E3C30',
                  border: '1px solid rgba(232,200,188,0.6)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                로그인
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}
