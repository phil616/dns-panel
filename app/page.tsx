'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { ZoneList } from '@/components/ZoneList';
import { DNSRecordManager } from '@/components/DNSRecordManager';
import { getAuth, clearAuth } from '@/lib/auth';
import { Zone } from '@/lib/api';
import { LogOut } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？\n\n退出后将清除本地存储的 Cookie 和凭据，下次使用需要重新输入 Token 进行登录。')) {
      clearAuth();
      setIsAuthenticated(false);
      setSelectedZone(null);
    }
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Zone List */}
      <div className="w-64 flex flex-col bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h1 className="font-bold text-gray-700">CF 管理器</h1>
          <button 
            onClick={handleLogout} 
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
           <ZoneList 
             selectedZoneId={selectedZone?.id || null} 
             onSelectZone={setSelectedZone} 
           />
        </div>
      </div>

      {/* Main Content - DNS Records */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedZone ? (
          <DNSRecordManager zone={selectedZone} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">未选择域名</h3>
              <p className="mt-1">请从左侧选择一个域名以管理 DNS 记录。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
