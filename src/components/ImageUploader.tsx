import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { UploadedImage } from '../types';

interface Props {
  label: string;
  image: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
}

export function ImageUploader({ label, image, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      onChange({
        url: result,
        base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-300">{label}</span>
      {image ? (
        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-zinc-800 group bg-zinc-900">
          <img src={image.url} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById(`upload-${label}`)?.click()}
          className={`aspect-[3/4] w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-zinc-400 bg-zinc-800/50' : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50'
          }`}
        >
          <Upload className="w-6 h-6 text-zinc-500 mb-2" />
          <span className="text-xs text-zinc-500 text-center px-4">点击或拖拽图片至此</span>
          <input
            id={`upload-${label}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
