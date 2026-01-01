import React, { useEffect, useState } from 'react';
import { api, Zone } from '../lib/api';
import { Search, Loader2 } from 'lucide-react';

interface ZoneListProps {
  selectedZoneId: string | null;
  onSelectZone: (zone: Zone) => void;
}

export const ZoneList: React.FC<ZoneListProps> = ({ selectedZoneId, onSelectZone }) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const data = await api.getZones();
      setZones(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredZones = zones.filter(z => 
    z.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">域名</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索域名..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredZones.map(zone => (
              <li key={zone.id}>
                <button
                  onClick={() => onSelectZone(zone)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    selectedZoneId === zone.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{zone.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{zone.status}</div>
                </button>
              </li>
            ))}
            {filteredZones.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                未找到域名。
              </div>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
