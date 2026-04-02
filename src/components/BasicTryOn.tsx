import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { UploadedImage, GeneratedResult, Resolution } from '../types';
import { generateTryOn } from '../lib/api';
import { Loader2, Wand2, Download } from 'lucide-react';
import { downloadImage } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function BasicTryOn({ onAddResult }: { onAddResult: (res: GeneratedResult) => void }) {
  const { profile, refreshProfile } = useAuth();
  const [model, setModel] = useState<UploadedImage | null>(null);
  const [garment, setGarment] = useState<UploadedImage | null>(null);
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!model || !garment) return;
    
    if (!profile || profile.points < 1) {
      setError("点数不足，请联系管理员充值。");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const imgUrl = await generateTryOn(model, garment, null, null, resolution);
      
      // Deduct points after successful generation
      const { error: rpcError } = await supabase.rpc('deduct_points', { amount: 1 });
      if (rpcError) {
        console.error("Failed to deduct points:", rpcError);
      } else {
        await refreshProfile();
      }

      setResult(imgUrl);
      onAddResult({
        id: Date.now().toString(),
        url: imgUrl,
        prompt: "基础试衣",
        timestamp: Date.now(),
        resolution
      });
    } catch (err: any) {
      setError(err.message || "生成图片失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* 左侧控制面板 - 增加宽度和间距 */}
      <div className="w-full lg:w-[400px] xl:w-[480px] flex-shrink-0 space-y-8 bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">基础试衣</h2>
          <p className="text-sm text-zinc-400">上传模特和服装，AI将为您自动穿搭。每次生成消耗 1 点数。</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ImageUploader label="模特图" image={model} onChange={setModel} />
          <ImageUploader label="服装图" image={garment} onChange={setGarment} />
        </div>

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

        <button
          onClick={handleGenerate}
          disabled={!model || !garment || isGenerating}
          className="w-full py-4 mt-4 bg-zinc-100 text-zinc-900 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all shadow-lg hover:shadow-xl"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {isGenerating ? '正在生成...' : '生成试衣图 (消耗 1 点)'}
        </button>
        {error && <p className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}
      </div>

      {/* 右侧预览区域 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[600px] relative group">
          {result ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <img src={result} alt="Generated" className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl" />
              <button
                onClick={() => downloadImage(result, `tryon-${Date.now()}.png`)}
                className="absolute bottom-4 right-4 p-3 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-xl backdrop-blur-sm border border-zinc-700 shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-medium">下载图片</span>
              </button>
            </div>
          ) : (
            <div className="text-zinc-500 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-zinc-800/30 flex items-center justify-center">
                <Wand2 className="w-10 h-10 opacity-40" />
              </div>
              <p className="text-base">生成的图片将显示在这里</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
