import { getAuth } from './auth';

const DEV_PROXY = '/api/cloudflare';
const DIRECT_API = 'https://api.cloudflare.com/client/v4';

const getBaseUrl = () => {
  const auth = getAuth();
  if (auth?.proxyUrl) {
    // Remove trailing slash if present
    return auth.proxyUrl.replace(/\/$/, '');
  }
  return import.meta.env.DEV ? DEV_PROXY : DIRECT_API;
};

const getHeaders = () => {
  const auth = getAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth?.apiToken) {
    // Heuristic: Global Keys are typically 37 chars hex. API Tokens are typically 40 chars.
    // If it looks like a Global Key and email is present, use X-Auth headers.
    // Otherwise, default to Bearer Token.
    const isGlobalKey = auth.apiToken.length === 37 && /^[a-f0-9]+$/i.test(auth.apiToken);

    if (auth.email && isGlobalKey) {
       headers['X-Auth-Email'] = auth.email;
       headers['X-Auth-Key'] = auth.apiToken;
    } else {
       headers['Authorization'] = `Bearer ${auth.apiToken}`;
    }
  }

  return headers;
};

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.errors?.[0]?.message || `API 请求错误: ${response.statusText}`);
  }

  const json = await response.json();
  if (!json.success) {
     throw new Error(json.errors?.[0]?.message || '未知 API 错误');
  }
  return json.result;
}

export interface Zone {
  id: string;
  name: string;
  status: string;
  account: {
    id: string;
    name: string;
  };
}

export interface DNSRecord {
  id: string;
  type: string; // A, AAAA, CNAME, etc.
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
  comment?: string;
  created_on: string;
  modified_on: string;
}

export const api = {
  getZones: async (name?: string) => {
    const query = name ? `?name=${encodeURIComponent(name)}` : '';
    return fetchAPI<Zone[]>(`/zones${query}`);
  },

  getDNSRecords: async (zoneId: string, search?: string) => {
    let query = `?per_page=100`;
    if (search) {
      query += `&name=${encodeURIComponent(search)}`; // Cloudflare filters by name
      // Note: Cloudflare search is strict match or needs match=all/any. 
      // Often simpler to just list and filter locally or use 'match=all'
    }
    return fetchAPI<DNSRecord[]>(`/zones/${zoneId}/dns_records${query}`);
  },

  createDNSRecord: async (zoneId: string, data: Partial<DNSRecord>) => {
    return fetchAPI<DNSRecord>(`/zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDNSRecord: async (zoneId: string, recordId: string, data: Partial<DNSRecord>) => {
    return fetchAPI<DNSRecord>(`/zones/${zoneId}/dns_records/${recordId}`, {
      method: 'PUT', // or PATCH
      body: JSON.stringify(data),
    });
  },

  deleteDNSRecord: async (zoneId: string, recordId: string) => {
    return fetchAPI<{ id: string }>(`/zones/${zoneId}/dns_records/${recordId}`, {
      method: 'DELETE',
    });
  },
  
  verifyToken: async () => {
      // Use a lightweight endpoint to verify
      return fetchAPI<{id: string, status: string}>(`/user/tokens/verify`);
  }
};
