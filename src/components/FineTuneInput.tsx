import React, { useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';

interface Props {
  onEdit: (prompt: string) => void;
  isEditing: boolean;
}

export function FineTuneInput({ onEdit, isEditing }: Props) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isEditing) {
      onEdit(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="w-full mt-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 px-2">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-zinc-200">AI 智能微调</span>
        <span className="text-xs text-zinc-500 ml-2">用大白话描述你想修改的地方</span>
      </div>
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如：换成红色的裙子、背景变成海滩、加上一副墨镜..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-4 pr-14 py-4 text-zinc-100 text-sm focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
          disabled={isEditing}
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isEditing}
          className="absolute right-2 p-2.5 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
