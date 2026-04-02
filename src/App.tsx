import React, { useState, useEffect } from 'react';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { BasicTryOn } from './components/BasicTryOn';
import { AdvancedTryOn } from './components/AdvancedTryOn';
import { FineTune } from './components/FineTune';
import { Gallery } from './components/Gallery';
import { GeneratedResult } from './types';
import { Scissors, Sparkles, Image as ImageIcon, History, Wand2, ShieldAlert, LogOut, Coins, Plus } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { RechargeModal } from './components/RechargeModal';

function MainApp() {
  const { user, profile, loading, signOut } = useAuth();
  const [hasKey, setHasKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'finetune' | 'gallery' | 'admin'>('basic');
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">加载中...</div>;
  }

  if (!user || !profile) {
    return <Login />;
  }

  if (!hasKey) {
    return <ApiKeyPrompt onSelect={handleSelectKey} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800">
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center shadow-sm">
              <Scissors className="w-6 h-6 text-zinc-950" />
            </div>
            <span className="text-xl font-semibold tracking-tight">AI 智能试衣间</span>
            
            <div className="ml-4 flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-zinc-300">{profile.points} 点</span>
              <button 
                onClick={() => setIsRechargeOpen(true)}
                className="ml-2 p-1 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition-colors"
                title="充值点数"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
              <TabButton
                active={activeTab === 'basic'}
                onClick={() => setActiveTab('basic')}
                icon={<Sparkles className="w-4 h-4" />}
                label="基础试衣"
              />
              <TabButton
                active={activeTab === 'advanced'}
                onClick={() => setActiveTab('advanced')}
                icon={<ImageIcon className="w-4 h-4" />}
                label="高级场景"
              />
              <TabButton
                active={activeTab === 'finetune'}
                onClick={() => setActiveTab('finetune')}
                icon={<Wand2 className="w-4 h-4" />}
                label="AI 微调"
              />
              <TabButton
                active={activeTab === 'gallery'}
                onClick={() => setActiveTab('gallery')}
                icon={<History className="w-4 h-4" />}
                label={`历史记录 (${results.length})`}
              />
              {profile.role === 'admin' && (
                <TabButton
                  active={activeTab === 'admin'}
                  onClick={() => setActiveTab('admin')}
                  icon={<ShieldAlert className="w-4 h-4 text-blue-400" />}
                  label="管理员"
                />
              )}
            </nav>
            
            <button
              onClick={signOut}
              className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-16">
        {activeTab === 'basic' && <BasicTryOn onAddResult={(res) => setResults(prev => [res, ...prev])} />}
        {activeTab === 'advanced' && <AdvancedTryOn onAddResult={(res) => setResults(prev => [res, ...prev])} />}
        {activeTab === 'finetune' && <FineTune onAddResult={(res) => setResults(prev => [res, ...prev])} />}
        {activeTab === 'gallery' && <Gallery results={results} />}
        {activeTab === 'admin' && profile.role === 'admin' && <AdminPanel />}
      </main>

      <RechargeModal isOpen={isRechargeOpen} onClose={() => setIsRechargeOpen(false)} />
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
