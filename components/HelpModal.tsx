import React from 'react';
import { X, Shield, Key, Network } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-gray-900">
            使用帮助与安全说明
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* 安全说明 */}
          <section>
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-green-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-800">数据安全与 Cookie</h4>
            </div>
            <div className="text-sm text-gray-600 space-y-2 pl-8">
              <p>
                本项目是一个<strong>纯前端</strong>应用，您的数据安全是我们最优先考虑的。
              </p>
              <ul className="list-disc list-outside space-y-1 ml-4">
                <li>
                  <strong>本地存储</strong>: 您的 API Token 仅存储在您本地浏览器的 Cookie 中。
                </li>
                <li>
                  <strong>有效期</strong>: Cookie 有效期设置为 7 天，过期后会自动清除，您需要重新登录。
                </li>
                <li>
                  <strong>传输安全</strong>: Token 仅会发送给 Cloudflare 官方 API 或您自行配置的 Worker 代理，绝不会发送给任何第三方服务器。
                </li>
              </ul>
            </div>
          </section>

          {/* Token 申请 */}
          <section>
            <div className="flex items-center mb-4">
              <Key className="h-6 w-6 text-blue-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-800">如何获取 API Token</h4>
            </div>
            <div className="text-sm text-gray-600 space-y-2 pl-8">
              <p>为了管理您的 DNS 记录，您需要从 Cloudflare 获取一个 API Token。</p>
              <ol className="list-decimal list-outside space-y-2 ml-4">
                <li>
                  访问 <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Cloudflare API Tokens 页面</a>。
                </li>
                <li>点击 <strong>Create Token (创建令牌)</strong>。</li>
                <li>
                  建议使用模板 <strong>Edit zone DNS (编辑区域 DNS)</strong>，点击 "Use template"。
                </li>
                <li>
                  或者自定义权限：
                  <ul className="list-disc ml-4 mt-1 text-xs text-gray-500">
                    <li>Zone - Zone - Read</li>
                    <li>Zone - DNS - Edit</li>
                  </ul>
                </li>
                <li>设定包含的资源（All zones 或指定域名）。</li>
                <li>点击 Continue to summary 并完成创建，复制生成的 Token。</li>
              </ol>
            </div>
          </section>

          {/* 交互说明 */}
          <section>
            <div className="flex items-center mb-4">
              <Network className="h-6 w-6 text-purple-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-800">关于网络交互</h4>
            </div>
            <div className="text-sm text-gray-600 space-y-2 pl-8">
              <p>
                本应用直接从您的浏览器向 Cloudflare API 发起请求，不经过任何中间服务器。
              </p>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-2">
                <h5 className="font-medium text-gray-900 mb-2">架构原理</h5>
                <p className="mb-2">
                  前端 (浏览器) &rarr; Cloudflare API
                </p>
              </div>
              <p className="mt-2 text-yellow-600">
                注意：如果遇到 CORS 跨域错误，可能是因为 Cloudflare API 对浏览器直接请求有限制。通常建议在本地开发使用，或者使用支持 CORS 的浏览器插件/配置。
              </p>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            我明白了
          </button>
        </div>
      </div>
    </div>
  );
};
