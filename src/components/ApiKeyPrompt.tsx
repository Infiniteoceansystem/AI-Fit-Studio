import React from 'react';
import { Key } from 'lucide-react';

export function ApiKeyPrompt({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-50 p-4 font-sans">
      <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
          <Key className="w-8 h-8 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">需要 API Key</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          本应用使用高质量图像生成模型，需要您提供自己的 Gemini API Key 才能继续使用。
          <br/><br/>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">了解计费详情</a>
        </p>
        <button
          onClick={onSelect}
          className="w-full py-3 px-4 bg-zinc-50 text-zinc-900 font-medium rounded-xl hover:bg-zinc-200 transition-colors shadow-sm"
        >
          选择 API Key
        </button>
      </div>
    </div>
  );
}
