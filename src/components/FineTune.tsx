import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { UploadedImage, GeneratedResult, Resolution } from '../types';
import { editImage } from '../lib/api';
import { Loader2, Sparkles, Download } from 'lucide-react';
import { FineTuneInput } from './FineTuneInput';
import { downloadImage } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function FineTune({ onAddResult }: { onAddResult: (res: GeneratedResult) => void }) {
  const { profile, refreshProfile } = useAuth();
  const [sourceImg, setSourceImg] = useState<UploadedImage | null>(null);
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [isEditing, setIsEditing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async (prompt: string) => {
    if (!sourceImg) return;
    
    if (!profile || profile.points < 1) {
      setError("点数不足，请联系管理员充值。");
      return;
    }

    setIsEditing(true);
    setError(null);
    try {
      const editedUrl = await editImage(sourceImg.url, prompt, resolution);
      
      // Deduct points after successful generation
      const { error: rpcError } = await supabase.rpc('deduct_points', { amount: 1 });
      if (rpcError) {
        console.error("Failed to deduct points:", rpcError);
      } else {
        await refreshProfile();
      }

      setResult(editedUrl);
      onAddResult({
        id: Date.now().toString(),
        url: editedUrl,
        prompt: `微调: ${prompt}`,
        timestamp: Date.now(),
        resolution
      });
    } catch (err: any) {
      setError(err.message || "微调图片失败");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* 左侧控制面板 */}
      <div className="w-full lg:w-[400px] xl:w-[480px] flex-shrink-0 space-y-8 bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">AI 智能微调</h2>
          <p className="text-sm text-zinc-400">上传需要修改的图片，用大白话描述您的修改需求。每次微调消耗 1 点数。</p>
        </div>

        <ImageUploader label="原图" image={sourceImg} onChange={setSourceImg} />

        <div className="space-y-3 pt-4 border-t border-zinc-800/50">
          <span className="text-sm font-medium text-zinc-300">选择分辨率</span>
          <div className="grid grid-cols-3 gap-3">
            {['1K', '2K', '4K'].map(res => (
              <button
                key={res}
                onClick={() => setResolution(res as Resolution)}
                className={`py-3 text-sm font-medium rounded-xl border transition-all ${
                  resolution === res
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}
      </div>

      {/* 右侧预览与微调区域 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[600px] relative">
          {result ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <img src={result} alt="Generated" className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl" />
              <button
                onClick={() => downloadImage(result, `finetune-${Date.now()}.png`)}
                className="absolute bottom-4 right-4 p-3 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-xl backdrop-blur-sm border border-zinc-700 shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-medium">下载图片</span>
              </button>
            </div>
          ) : sourceImg ? (
             <div className="w-full h-full flex flex-col items-center justify-center relative opacity-50">
              <img src={sourceImg.url} alt="Source" className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl grayscale" />
            </div>
          ) : (
            <div className="text-zinc-500 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800/30 flex items-center justify-center">
                <Sparkles className="w-10 h-10 opacity-40" />
              </div>
              <p className="text-base">上传图片后即可开始微调</p>
            </div>
          )}
        </div>
        
        {/* 微调输入框 */}
        <div className={`transition-opacity duration-300 ${sourceImg ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <FineTuneInput onEdit={handleEdit} isEditing={isEditing} />
        </div>
      </div>
    </div>
  );
}

