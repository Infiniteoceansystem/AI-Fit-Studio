import React, { useState } from 'react';
import { X, Loader2, QrCode, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PACKAGES = [
  { points: 10, price: 9.9, id: 'pkg_10' },
  { points: 50, price: 39.9, id: 'pkg_50', popular: true },
  { points: 200, price: 129.9, id: 'pkg_200' },
];

export function RechargeModal({ isOpen, onClose }: RechargeModalProps) {
  const { user, refreshProfile } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [step, setStep] = useState<'select' | 'qrcode' | 'success'>('select');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleGenerateQR = () => {
    setStep('qrcode');
    // Simulate waiting for user to scan and pay
    setTimeout(() => {
      handlePaymentSuccess();
    }, 5000); // Simulate a 5-second payment process
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    setIsProcessing(true);
    
    // In a real app, this would be handled by a secure backend webhook from Alipay/WeChat.
    // Here we simulate it by calling the admin RPC (Note: in production, users shouldn't be able to call this directly, 
    // it should be a backend service account calling it).
    // For demonstration, we'll just show success. To actually add points securely without admin rights,
    // we would need a different RPC or backend endpoint.
    
    // Mocking the backend adding points:
    const { error } = await supabase.rpc('add_points_to_user', {
      target_user_id: user.id,
      amount: selectedPkg.points
    });

    // Even if it fails (because user is not admin), we show success for the demo UI
    // In a real scenario, the webhook updates the DB, and the frontend just listens to DB changes.
    
    await refreshProfile();
    setIsProcessing(false);
    setStep('success');
  };

  const resetAndClose = () => {
    setStep('select');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-100">充值点数</h2>
          <button onClick={resetAndClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">选择套餐</label>
                <div className="grid grid-cols-3 gap-3">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`relative p-4 rounded-2xl border-2 text-center transition-all ${
                        selectedPkg.id === pkg.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          推荐
                        </span>
                      )}
                      <div className="text-xl font-bold text-zinc-100 mb-1">{pkg.points} <span className="text-sm font-normal text-zinc-400">点</span></div>
                      <div className="text-sm text-blue-400 font-medium">¥{pkg.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-3">支付方式</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('wechat')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'wechat'
                        ? 'border-[#09B83E] bg-[#09B83E]/10 text-[#09B83E]'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#09B83E] flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="font-medium">微信支付</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('alipay')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'alipay'
                        ? 'border-[#1677FF] bg-[#1677FF]/10 text-[#1677FF]'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-sm bg-[#1677FF] flex items-center justify-center text-white font-bold text-xs">
                      支
                    </div>
                    <span className="font-medium">支付宝</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateQR}
                className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-semibold transition-colors mt-4"
              >
                确认支付 ¥{selectedPkg.price}
              </button>
            </div>
          )}

          {step === 'qrcode' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-zinc-100">
                  请使用 {paymentMethod === 'wechat' ? '微信' : '支付宝'} 扫码
                </h3>
                <p className="text-zinc-400 text-sm">支付金额: <span className="text-blue-400 font-bold text-lg">¥{selectedPkg.price}</span></p>
              </div>
              
              <div className="w-48 h-48 bg-white rounded-2xl p-4 flex items-center justify-center relative">
                <QrCode className="w-full h-full text-zinc-900" />
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-2xl">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                  <span className="text-sm font-medium text-zinc-800">模拟支付中...</span>
                </div>
              </div>
              
              <p className="text-xs text-zinc-500 text-center px-8">
                (这是一个演示界面。在真实环境中，这里会显示真实的支付二维码，并在用户手机端支付成功后自动跳转。)
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100">支付成功！</h3>
              <p className="text-zinc-400 text-center">
                已成功为您充值 <span className="text-white font-bold">{selectedPkg.points}</span> 点数。
              </p>
              <button
                onClick={resetAndClose}
                className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
              >
                完成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
