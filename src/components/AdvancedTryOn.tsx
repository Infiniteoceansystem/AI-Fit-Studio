import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { UploadedImage, GeneratedResult, Resolution } from '../types';
import { generateTryOn } from '../lib/api';
import { Loader2, Wand2, Layers, Download, Plus, X, ChevronDown, ChevronUp, Expand, Shrink, Maximize, User, ArrowUpFromLine, ArrowDownToLine, ZoomIn, Undo2 } from 'lucide-react';
import { downloadImage } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const POSE_PRESETS = [
  {
    id: 'standing',
    title: '自然站立',
    prompt: '正面自然站立，双手自然下垂，身体挺拔，纯肢体动作',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <line x1="12" y1="14" x2="9" y2="21" />
        <line x1="12" y1="14" x2="15" y2="21" />
        <line x1="12" y1="8" x2="8" y2="13" />
        <line x1="12" y1="8" x2="16" y2="13" />
      </svg>
    )
  },
  {
    id: 'open_arms',
    title: '张开双臂',
    prompt: '双臂向两侧自然张开，身体舒展，纯肢体动作',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <line x1="12" y1="14" x2="9" y2="21" />
        <line x1="12" y1="14" x2="15" y2="21" />
        <path d="M12 8 Q 8 8 5 4" />
        <path d="M12 8 Q 16 8 19 4" />
      </svg>
    )
  },
  {
    id: 'hands_hips',
    title: '自信叉腰',
    prompt: '正面站立，双手叉腰，肩膀自然打开，气场强大，纯肢体动作',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <line x1="12" y1="14" x2="9" y2="21" />
        <line x1="12" y1="14" x2="15" y2="21" />
        <polyline points="12,8 8,11 11,14" />
        <polyline points="12,8 16,11 13,14" />
      </svg>
    )
  },
  {
    id: 'hand_pocket',
    title: '单手插兜',
    prompt: '身体微微侧倾，单手做出插兜动作，姿态酷飒，纯肢体动作',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <line x1="12" y1="14" x2="10" y2="21" />
        <line x1="12" y1="14" x2="14" y2="21" />
        <line x1="12" y1="8" x2="9" y2="14" />
        <polyline points="12,8 16,11 13,14" />
      </svg>
    )
  },
  {
    id: 'walking',
    title: '动态迈步',
    prompt: '呈迈步走动的动态姿势，步伐轻盈，双臂自然摆动，纯肢体动作',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="12" y1="13" x2="8" y2="18" />
        <line x1="8" y1="18" x2="5" y2="21" />
        <line x1="12" y1="13" x2="16" y2="21" />
        <line x1="12" y1="8" x2="16" y2="12" />
        <line x1="12" y1="8" x2="8" y2="12" />
      </svg>
    )
  },
  {
    id: 'sitting',
    title: '悬空坐姿',
    prompt: '呈坐姿状态，双腿自然交叠，身体重心下沉，纯肢体动作不包含环境物体',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="10" cy="7" r="2" />
        <line x1="10" y1="9" x2="10" y2="15" />
        <line x1="10" y1="15" x2="16" y2="15" />
        <line x1="16" y1="15" x2="16" y2="21" />
        <line x1="10" y1="10" x2="14" y2="13" />
        <line x1="6" y1="15" x2="12" y2="15" />
        <line x1="6" y1="15" x2="6" y2="21" />
      </svg>
    )
  },
  {
    id: 'look_back',
    title: '侧身回眸',
    prompt: '身体侧面站立，头部自然回眸，展现背部与侧脸线条，纯肢体动作',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7 Q 14 10 12 14" />
        <line x1="12" y1="14" x2="10" y2="21" />
        <line x1="12" y1="14" x2="14" y2="21" />
        <path d="M12 8 Q 10 12 12 14" />
      </svg>
    )
  },
  {
    id: 'leaning',
    title: '侧倾倚靠',
    prompt: '身体重心微微侧倾，呈慵懒的倚靠姿态，纯肢体动作不包含环境物体',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <circle cx="14" cy="6" r="2" />
        <line x1="14" y1="8" x2="10" y2="15" />
        <line x1="10" y1="15" x2="8" y2="21" />
        <line x1="10" y1="15" x2="12" y2="21" />
        <line x1="13" y1="10" x2="8" y2="10" />
        <line x1="4" y1="4" x2="4" y2="21" />
      </svg>
    )
  }
];

const EXPRESSION_PRESETS = [
  {
    id: 'smile',
    title: '灿烂微笑',
    prompt: '面部表情生动：笑容灿烂，露出洁白的牙齿，眼神充满喜悦',
    emoji: '😄'
  },
  {
    id: 'cool',
    title: '高冷酷飒',
    prompt: '面部表情生动：表情高冷，眼神深邃锐利，嘴唇微闭，充满表现力',
    emoji: '😎'
  },
  {
    id: 'gentle',
    title: '温柔亲和',
    prompt: '面部表情生动：嘴角微微上扬，眼神温柔似水，散发着亲和力',
    emoji: '😊'
  },
  {
    id: 'playful',
    title: '俏皮生动',
    prompt: '面部表情生动：微微眨眼或挑眉，表情生动俏皮，充满青春活力',
    emoji: '😉'
  }
];

const CAMERA_ANGLES = [
  { id: 'full', title: '全身远景', prompt: 'Full body wide shot, showing the entire outfit and environment', icon: <Maximize className="w-5 h-5" /> },
  { id: 'medium', title: '平视中景', prompt: 'Medium shot, eye-level camera, focusing on the upper body and outfit details', icon: <User className="w-5 h-5" /> },
  { id: 'low', title: '仰视视角', prompt: 'Low angle shot, camera looking up at the person, making them look taller', icon: <ArrowUpFromLine className="w-5 h-5" /> },
  { id: 'high', title: '俯视视角', prompt: 'High angle shot, camera looking down at the person', icon: <ArrowDownToLine className="w-5 h-5" /> },
  { id: 'close', title: '特写近景', prompt: 'Close-up shot, focusing closely on the face and upper garment texture', icon: <ZoomIn className="w-5 h-5" /> },
  { id: 'back', title: '侧后方视角', prompt: 'Over-the-shoulder shot or back view, showing the back of the outfit', icon: <Undo2 className="w-5 h-5" /> }
];

interface BatchItem {
  id: string;
  poseId: string;
  expressionId: string;
  cameraAngleId: string;
  customPrompt: string;
  isExpanded: boolean;
}

export function AdvancedTryOn({ onAddResult }: { onAddResult: (res: GeneratedResult) => void }) {
  const { profile, refreshProfile } = useAuth();
  const [model, setModel] = useState<UploadedImage | null>(null);
  const [topGarment, setTopGarment] = useState<UploadedImage | null>(null);
  const [bottomGarment, setBottomGarment] = useState<UploadedImage | null>(null);
  const [bg, setBg] = useState<UploadedImage | null>(null);
  const [resolution, setResolution] = useState<Resolution>('1K');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    { id: '1', poseId: 'standing', expressionId: 'smile', cameraAngleId: 'full', customPrompt: '', isExpanded: true }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBatchPanelExpanded, setIsBatchPanelExpanded] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addBatchItem = () => {
    const newItems = batchItems.map(item => ({ ...item, isExpanded: false }));
    setBatchItems([...newItems, { 
      id: Date.now().toString(), 
      poseId: 'standing', 
      expressionId: 'smile', 
      cameraAngleId: 'full',
      customPrompt: '', 
      isExpanded: true 
    }]);
  };

  const removeBatchItem = (id: string) => {
    if (batchItems.length > 1) {
      setBatchItems(batchItems.filter(item => item.id !== id));
    }
  };

  const toggleExpand = (id: string) => {
    setBatchItems(batchItems.map(item => 
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const updateBatchItem = (id: string, field: keyof BatchItem, value: string | boolean) => {
    setBatchItems(batchItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleGenerate = async () => {
    if (!model || !topGarment) return;
    
    const count = batchItems.length;
    if (!profile || profile.points < count) {
      setError(`点数不足，需要 ${count} 点，请联系管理员充值。`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const promises = batchItems.map((item, idx) => {
        const poseText = item.poseId ? POSE_PRESETS.find(p => p.id === item.poseId)?.prompt : '';
        const expText = item.expressionId ? EXPRESSION_PRESETS.find(e => e.id === item.expressionId)?.prompt : '';
        const cameraAngleText = item.cameraAngleId ? CAMERA_ANGLES.find(c => c.id === item.cameraAngleId)?.prompt : '';
        
        const finalPose = [item.customPrompt, poseText, expText].filter(Boolean).join('，');

        return generateTryOn(model, topGarment, bottomGarment, bg, resolution, finalPose, cameraAngleText, idx + 1);
      });
      const generatedUrls = await Promise.all(promises);
      
      // Deduct points after successful generation
      const { error: rpcError } = await supabase.rpc('deduct_points', { amount: count });
      if (rpcError) {
        console.error("Failed to deduct points:", rpcError);
      } else {
        await refreshProfile();
      }

      setResults(generatedUrls);

      generatedUrls.forEach((url, idx) => {
        const item = batchItems[idx];
        const poseTitle = POSE_PRESETS.find(p => p.id === item.poseId)?.title || '默认姿势';
        const expTitle = EXPRESSION_PRESETS.find(e => e.id === item.expressionId)?.title || '默认表情';
        const angleTitle = CAMERA_ANGLES.find(c => c.id === item.cameraAngleId)?.title || '默认视角';
        
        onAddResult({
          id: `${Date.now()}-${idx}`,
          url,
          prompt: `高级场景 - ${poseTitle} · ${expTitle} · ${angleTitle}`,
          timestamp: Date.now(),
          resolution
        });
      });
    } catch (err: any) {
      setError(err.message || "生成图片失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* 左侧控制面板 */}
      <div className="w-full lg:w-[400px] xl:w-[480px] flex-shrink-0 space-y-8 bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800/50">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">高级场景</h2>
          <p className="text-sm text-zinc-400">融合背景、自定义姿势，支持无上限批量生成。每张消耗 1 点数。</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <ImageUploader label="模特图" image={model} onChange={setModel} />
          <ImageUploader label="背景图 (可选)" image={bg} onChange={setBg} />
          <ImageUploader label="上衣图" image={topGarment} onChange={setTopGarment} />
          <ImageUploader label="下装图 (可选)" image={bottomGarment} onChange={setBottomGarment} />
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

        <div className="space-y-4 bg-zinc-900/30 p-5 rounded-2xl border border-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-medium text-zinc-200 block">批量生成配置</span>
              <span className="text-xs text-zinc-500">已配置 {batchItems.length} 张图片</span>
            </div>
            <button 
              onClick={() => setIsBatchPanelExpanded(true)} 
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800"
              title="全屏展开配置面板"
            >
              <Expand className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setIsBatchPanelExpanded(true)} 
            className="w-full py-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Layers className="w-4 h-4" />
            打开全屏配置面板
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!model || !topGarment || isGenerating}
          className="w-full py-4 mt-4 bg-zinc-100 text-zinc-900 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-all shadow-lg hover:shadow-xl"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {isGenerating ? '正在生成...' : `生成多姿势场景 (消耗 ${batchItems.length} 点)`}
        </button>
        {error && <p className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}
      </div>

      {/* 右侧预览区域 */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-8 min-h-[600px] flex flex-col">
          {results.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-zinc-300 font-medium">生成结果</h3>
              </div>
              <div className={`grid gap-6 ${results.length === 1 ? 'grid-cols-1' : results.length === 2 ? 'grid-cols-2' : 'grid-cols-2 xl:grid-cols-3'}`}>
                {results.map((res, idx) => (
                  <div 
                    key={idx} 
                    className="relative group rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all"
                  >
                    <img src={res} alt={`Generated ${idx}`} className="w-full h-auto object-cover" />
                    <button
                      onClick={() => downloadImage(res, `advanced-tryon-${Date.now()}-${idx}.png`)}
                      className="absolute bottom-3 right-3 p-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-lg backdrop-blur-sm border border-zinc-700 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="下载图片"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4 flex-1">
              <div className="w-20 h-20 rounded-full bg-zinc-800/30 flex items-center justify-center">
                <Layers className="w-10 h-10 opacity-40" />
              </div>
              <p className="text-base">生成的多姿势图片将显示在这里</p>
            </div>
          )}
        </div>
      </div>
      {/* Full Screen Batch Panel Modal */}
      {isBatchPanelExpanded && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-7xl h-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/50">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-100">批量生成配置面板</h2>
                <p className="text-sm text-zinc-400 mt-1">精细化配置每一张图片的姿势、表情和视角，支持无限添加。</p>
              </div>
              <button 
                onClick={() => setIsBatchPanelExpanded(false)} 
                className="p-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors"
                title="收起面板"
              >
                <Shrink className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/30">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {batchItems.map((item, index) => (
                  <div key={item.id} className="flex flex-col bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
                    {/* Card Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-800/20">
                      <span className="text-sm font-semibold text-zinc-200 bg-zinc-800 px-3 py-1 rounded-full">
                        第 {index + 1} 张
                      </span>
                      {batchItems.length > 1 && (
                        <button 
                          onClick={() => removeBatchItem(item.id)} 
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                          title="删除此张"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-6">
                      {/* Pose Selection */}
                      <div>
                        <span className="text-xs font-medium text-zinc-400 mb-3 flex items-center gap-2">
                          <User className="w-3.5 h-3.5" /> 选择姿势 (纯动作)
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {POSE_PRESETS.map(p => (
                            <button
                              key={p.id}
                              onClick={() => updateBatchItem(item.id, 'poseId', p.id)}
                              className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all group ${
                                item.poseId === p.id 
                                  ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm' 
                                  : 'border-zinc-800/50 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                              }`}
                            >
                              <div className={`w-6 h-6 mb-1.5 transition-transform group-hover:scale-110 ${item.poseId === p.id ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                {p.icon}
                              </div>
                              <span className="text-[10px] font-medium text-center leading-tight">{p.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Expression Selection */}
                      <div>
                        <span className="text-xs font-medium text-zinc-400 mb-3 flex items-center gap-2">
                          <span className="text-sm">😊</span> 选择表情
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {EXPRESSION_PRESETS.map(e => (
                            <button
                              key={e.id}
                              onClick={() => updateBatchItem(item.id, 'expressionId', e.id)}
                              className={`flex flex-col items-center justify-center py-2 rounded-xl border-2 transition-all group ${
                                item.expressionId === e.id 
                                  ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm' 
                                  : 'border-zinc-800/50 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                              }`}
                            >
                              <span className="text-lg mb-1 transition-transform group-hover:scale-110">{e.emoji}</span>
                              <span className="text-[10px] font-medium">{e.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Camera Angle Selection */}
                      <div>
                        <span className="text-xs font-medium text-zinc-400 mb-3 flex items-center gap-2">
                          <ZoomIn className="w-3.5 h-3.5" /> 选择视角
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {CAMERA_ANGLES.map(c => (
                            <button
                              key={c.id}
                              onClick={() => updateBatchItem(item.id, 'cameraAngleId', c.id)}
                              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border-2 transition-all group ${
                                item.cameraAngleId === c.id 
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm' 
                                  : 'border-zinc-800/50 bg-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                              }`}
                            >
                              <div className={`mb-1.5 transition-transform group-hover:scale-110 ${item.cameraAngleId === c.id ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                {c.icon}
                              </div>
                              <span className="text-[10px] font-medium text-center leading-tight">{c.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Prompt */}
                      <div>
                        <span className="text-xs font-medium text-zinc-400 mb-2 block">补充描述 (可选)</span>
                        <input 
                          type="text"
                          value={item.customPrompt}
                          onChange={(e) => updateBatchItem(item.id, 'customPrompt', e.target.value)}
                          placeholder="如: 手拿咖啡..."
                          className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 w-full transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add New Item Button */}
                <button 
                  onClick={addBatchItem}
                  className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/30 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="font-medium">添加一张新图片</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between backdrop-blur-md">
              <div className="text-zinc-400 text-sm">
                已配置 <strong className="text-zinc-100 text-lg">{batchItems.length}</strong> 张图片，将消耗 <strong className="text-blue-400 text-lg">{batchItems.length}</strong> 点数。
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsBatchPanelExpanded(false)} 
                  className="px-6 py-3.5 rounded-xl font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  继续编辑基础信息
                </button>
                <button 
                  onClick={() => { setIsBatchPanelExpanded(false); handleGenerate(); }} 
                  disabled={!model || !topGarment || isGenerating}
                  className="px-8 py-3.5 bg-zinc-100 text-zinc-900 rounded-xl font-medium hover:bg-white transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  {isGenerating ? '正在生成...' : '确认并开始生成'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
