import React, { useState, useEffect } from 'react';
import { DNSRecord } from '../lib/api';
import { X } from 'lucide-react';

interface DNSRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<DNSRecord>) => Promise<void>;
  record?: DNSRecord; // If present, it's Edit mode
}

const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'LOC', 'SPF', 'CAA', 'PTR'];

export const DNSRecordModal: React.FC<DNSRecordModalProps> = ({ isOpen, onClose, onSave, record }) => {
  const [formData, setFormData] = useState<Partial<DNSRecord>>({
    type: 'A',
    name: '',
    content: '',
    ttl: 1, // Auto
    proxied: true,
    comment: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({
        type: record.type,
        name: record.name,
        content: record.content,
        ttl: record.ttl,
        proxied: record.proxied,
        comment: record.comment || '',
      });
    } else {
      setFormData({
        type: 'A',
        name: '',
        content: '',
        ttl: 1,
        proxied: true,
        comment: '',
      });
    }
    setError('');
  }, [record, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {record ? '编辑 DNS 记录' : '添加 DNS 记录'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">TTL</label>
              <select
                value={formData.ttl}
                onChange={(e) => setFormData({ ...formData, ttl: Number(e.target.value) })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                <option value={1}>自动</option>
                <option value={60}>1 分钟</option>
                <option value={120}>2 分钟</option>
                <option value={300}>5 分钟</option>
                <option value={600}>10 分钟</option>
                <option value={1800}>30 分钟</option>
                <option value={3600}>1 小时</option>
                <option value={7200}>2 小时</option>
                <option value={14400}>4 小时</option>
                <option value={28800}>8 小时</option>
                <option value={43200}>12 小时</option>
                <option value={86400}>1 天</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">名称</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="@, www, etc."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">使用 @ 代表根域名</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">内容</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              placeholder="IPv4 address, hostname, etc."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
            />
          </div>

          <div className="flex items-center">
            <input
              id="proxied"
              type="checkbox"
              checked={formData.proxied}
              onChange={(e) => setFormData({ ...formData, proxied: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="proxied" className="ml-2 block text-sm text-gray-900">
              代理状态 (Cloudflare CDN)
            </label>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700">备注</label>
            <input
              type="text"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
