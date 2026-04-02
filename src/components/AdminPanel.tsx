import React, { useState, useEffect } from 'react';
import { supabase, adminAuthClient } from '../lib/supabase';
import { Profile, useAuth } from '../contexts/AuthContext';
import { Users, Plus, Coins, Loader2, ShieldAlert } from 'lucide-react';

export function AdminPanel() {
  const { user: currentUser, refreshProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create user state
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Add points state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState<number>(10);
  const [isAddingPoints, setIsAddingPoints] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data as Profile[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    setCreateSuccess(false);

    // Use adminAuthClient to avoid logging out the current admin
    const { data, error } = await adminAuthClient.auth.signUp({
      email: newEmail,
      password: newPassword,
    });

    if (error) {
      setCreateError(error.message);
    } else {
      setCreateSuccess(true);
      setNewEmail('');
      setNewPassword('');
      // Refresh user list after a short delay to allow trigger to create profile
      setTimeout(fetchUsers, 1000);
    }
    setIsCreating(false);
  };

  const handleAddPoints = async (userId: string) => {
    setIsAddingPoints(true);
    const { error } = await supabase.rpc('add_points_to_user', {
      target_user_id: userId,
      amount: pointsToAdd
    });

    if (!error) {
      await fetchUsers();
      // If the admin recharged themselves, update the top nav bar immediately
      if (currentUser && currentUser.id === userId) {
        await refreshProfile();
      }
      setSelectedUserId(null);
    } else {
      alert('添加点数失败: ' + error.message);
    }
    setIsAddingPoints(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-zinc-100">创建新账号</h2>
        </div>
        
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">邮箱</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-600"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">密码 (至少6位)</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-600"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            创建账号
          </button>
        </form>
        {createError && <p className="text-red-400 text-sm mt-3">{createError}</p>}
        {createSuccess && <p className="text-green-400 text-sm mt-3">账号创建成功！</p>}
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-zinc-100" />
          <h2 className="text-xl font-semibold text-zinc-100">用户管理</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
                  <th className="pb-3 font-medium">邮箱</th>
                  <th className="pb-3 font-medium">角色</th>
                  <th className="pb-3 font-medium">剩余点数</th>
                  <th className="pb-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 text-zinc-200">{u.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-xs ${u.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {u.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-200 font-mono">{u.points}</td>
                    <td className="py-4 text-right">
                      {selectedUserId === u.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            value={pointsToAdd}
                            onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                            className="w-20 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1.5 text-zinc-100 text-sm"
                          />
                          <button
                            onClick={() => handleAddPoints(u.id)}
                            disabled={isAddingPoints}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => setSelectedUserId(null)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUserId(u.id);
                            setPointsToAdd(10);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          充值点数
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
