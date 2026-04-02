import React from 'react';
import { GeneratedResult } from '../types';
import { History, Download } from 'lucide-react';
import { downloadImage } from '../lib/utils';

export function Gallery({ results }: { results: GeneratedResult[] }) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-4">
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center">
          <History className="w-10 h-10 opacity-50" />
        </div>
        <p className="text-lg font-medium">暂无生成的图片</p>
        <p className="text-sm opacity-70">请在基础试衣或高级场景中生成图片。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.map((res) => (
        <div key={res.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-md">
          <img src={res.url} alt="Generated" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-zinc-400">{new Date(res.timestamp).toLocaleString()}</p>
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded-sm">{res.resolution}</span>
            </div>
            <p className="text-sm text-zinc-100 font-medium line-clamp-2">{res.prompt}</p>
          </div>
          <button
            onClick={() => downloadImage(res.url, `gallery-${res.id}.png`)}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
            title="下载图片"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
