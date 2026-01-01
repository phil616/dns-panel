import React, { useState } from 'react';
import { setAuth, AuthData } from '../lib/auth';
import { api } from '../lib/api';
import { Lock, Mail, AlertCircle, HelpCircle } from 'lucide-react';
import { HelpModal } from './HelpModal';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const authData: AuthData = {
      apiToken: token,
      email: email || undefined,
    };

    // Save temporarily to test connection
    setAuth(authData);

    try {
      // Try to fetch zones to verify connectivity and auth
      await api.getZones(); 
      onLogin();
    } catch (err: any) {
      console.error(err);
      setError(err.message || '连接失败，请检查您的 Token。');
      // Don't clear auth yet, let user correct it
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg relative">
        <button
          onClick={() => setHelpOpen(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors"
          title="使用帮助与安全说明"
        >
          <HelpCircle className="h-6 w-6" />
        </button>

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cloudflare DNS 管理器
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请输入您的凭据以管理 DNS 记录
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="API Token (或 Global API Key)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="邮箱 (可选，Global Key 必填)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">连接错误</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '连接中...' : '连接'}
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            <p>注意：本地开发如果使用 Vite 代理则不需要填写代理 URL。</p>
          </div>
        </form>
      </div>
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
};
