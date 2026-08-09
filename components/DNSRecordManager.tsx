import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { api, Zone, DNSRecord } from '../lib/api';
import { filterDNSRecords } from '../lib/search';
import { DNSRecordModal } from './DNSRecordModal';
import { Plus, Search, Edit2, Trash2, Cloud, CloudOff, RefreshCw, Loader2 } from 'lucide-react';

interface DNSRecordManagerProps {
  zone: Zone;
}

export const DNSRecordManager: React.FC<DNSRecordManagerProps> = ({ zone }) => {
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | undefined>(undefined);
  const [error, setError] = useState('');
  const activeRequest = useRef(0);

  const fetchRecords = useCallback(async (signal?: AbortSignal) => {
    const requestId = ++activeRequest.current;
    setLoading(true);
    setError('');
    try {
      const data = await api.getDNSRecords(zone.id, { signal });
      if (requestId === activeRequest.current) setRecords(data);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      if (requestId === activeRequest.current) {
        setError((err as Error).message || '加载 DNS 记录失败');
      }
    } finally {
      if (requestId === activeRequest.current && !signal?.aborted) setLoading(false);
    }
  }, [zone.id]);

  useEffect(() => {
    const controller = new AbortController();
    setSearch('');
    setRecords([]);
    fetchRecords(controller.signal);
    return () => controller.abort();
  }, [fetchRecords]);

  const filteredRecords = useMemo(
    () => filterDNSRecords(records, search),
    [records, search],
  );

  const handleAdd = () => {
    setEditingRecord(undefined);
    setModalOpen(true);
  };

  const handleEdit = (record: DNSRecord) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      await api.deleteDNSRecord(zone.id, recordId);
      fetchRecords();
    } catch (error) {
      alert('删除记录失败');
    }
  };

  const handleSave = async (data: Partial<DNSRecord>) => {
    if (editingRecord) {
      await api.updateDNSRecord(zone.id, editingRecord.id, data);
    } else {
      await api.createDNSRecord(zone.id, data);
    }
    fetchRecords();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{zone.name}</h2>
          <p className="text-sm text-gray-500">DNS 记录管理</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加记录
        </button>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center space-x-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索记录..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <button 
          onClick={() => fetchRecords()}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
          title="刷新"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">类型</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">代理</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">TTL</th>
              <th scope="col" className="relative px-6 py-3 w-24"><span className="sr-only">操作</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {record.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={record.content}>
                  {record.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.proxied ? (
                    <div title="已代理">
                      <Cloud className="h-5 w-5 text-orange-500" />
                    </div>
                  ) : (
                    <div title="仅 DNS">
                      <CloudOff className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.ttl === 1 ? '自动' : record.ttl}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(record)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !error && filteredRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                  {search.trim() ? '未找到匹配的记录。' : '暂无 DNS 记录。'}
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-red-500 text-sm">
                  {error}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      <DNSRecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        record={editingRecord}
      />
    </div>
  );
};
