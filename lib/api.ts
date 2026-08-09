const PROXY_API = '/api/cloudflare';
const ZONES_PER_PAGE = 50;
const DNS_RECORDS_PER_PAGE = 5000;

const getBaseUrl = () => {
  return PROXY_API;
};

const getHeaders = () => {
  // In Next.js Proxy mode, the frontend does NOT send the Token in headers directly.
  // The token is in the Cookie, which is automatically sent.
  // We only need Content-Type.
  return {
    'Content-Type': 'application/json',
  };
};

interface CloudflareError {
  message?: string;
}

interface CloudflareResultInfo {
  page?: number;
  total_pages?: number;
}

interface CloudflareResponse<T> {
  success: boolean;
  result: T;
  errors?: CloudflareError[];
  result_info?: CloudflareResultInfo;
}

async function requestAPI<T>(endpoint: string, options: RequestInit = {}): Promise<CloudflareResponse<T>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const json = await response.json().catch(() => null) as CloudflareResponse<T> | null;

  if (!response.ok || !json?.success) {
    throw new Error(json?.errors?.[0]?.message || `API 请求错误: ${response.statusText || response.status}`);
  }

  return json;
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const json = await requestAPI<T>(endpoint, options);
  return json.result;
}

async function fetchAllPages<T>(
  endpoint: string,
  perPage: number,
  options: RequestInit = {},
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;

  while (true) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await requestAPI<T[]>(
      `${endpoint}${separator}page=${page}&per_page=${perPage}`,
      options,
    );

    results.push(...response.result);

    const totalPages = response.result_info?.total_pages;
    if (typeof totalPages === 'number') {
      if (page >= totalPages) break;
    } else if (response.result.length < perPage) {
      break;
    }

    page += 1;
  }

  return results;
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
  getZones: async (options: RequestInit = {}) => {
    return fetchAllPages<Zone>('/zones', ZONES_PER_PAGE, options);
  },

  getDNSRecords: async (zoneId: string, options: RequestInit = {}) => {
    return fetchAllPages<DNSRecord>(
      `/zones/${encodeURIComponent(zoneId)}/dns_records`,
      DNS_RECORDS_PER_PAGE,
      options,
    );
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
