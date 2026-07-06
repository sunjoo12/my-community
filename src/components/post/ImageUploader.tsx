'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { X, ImagePlus } from 'lucide-react';

interface ImageUploaderProps {
  value: File | null;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
}

export default function ImageUploader({ value, previewUrl, onChange }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
      setDragOver(false);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  if (previewUrl) {
    return (
      <div className='relative w-full aspect-video rounded-[14px] overflow-hidden border' style={{ borderColor: '#E8C8BC' }}>
        <Image src={previewUrl} alt='업로드 미리보기' fill className='object-cover' />
        <button
          type='button'
          onClick={() => onChange(null)}
          className='absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-80'
          style={{ backgroundColor: 'rgba(61,40,32,0.7)' }}
          aria-label='이미지 삭제'
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className='w-full aspect-video rounded-[14px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all'
      style={{
        borderColor: isDragActive || dragOver ? '#CC7058' : '#E8C8BC',
        backgroundColor: isDragActive || dragOver ? '#FFF3EE' : '#FAF6F2',
      }}
      aria-label='이미지 업로드 영역'
    >
      <input {...getInputProps()} />
      <ImagePlus
        size={36}
        className='mb-3 transition-colors'
        style={{ color: isDragActive ? '#CC7058' : '#C0B2BC' }}
      />
      <p className='text-sm font-medium' style={{ color: '#5E3C30' }}>
        +
      </p>
      <p className='text-sm font-medium mt-1' style={{ color: '#5E3C30' }}>
        사진을 업로드하세요.
      </p>
      <p className='text-xs mt-1.5' style={{ color: '#8A6A60' }}>
        드래그&드롭 또는 클릭 · 최대 5MB
      </p>
    </div>
  );
}
