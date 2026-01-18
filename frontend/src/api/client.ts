/**
 * API client for the Wine Lottery backend.
 */

import type {
  Draw,
  DrawListItem,
  CreateDrawPayload,
  PerformDrawPayload,
  PreviewResult,
  Algorithm,
  Statistics,
  Wine,
  WineListItem,
  CreateWinePayload,
  WineTypeInfo,
  VinmonopoletSearchResult,
} from '../types';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const data = await response.json();
      message = data.error || data.detail || JSON.stringify(data);
    } catch {
      message = response.statusText;
    }
    throw new ApiError(response.status, message);
  }

  const text = await response.text();
  if (!text) return {} as T;
  
  return JSON.parse(text);
}

// Wines API
export const winesApi = {
  list: (params?: { type?: string; search?: string; includeInactive?: boolean }): Promise<WineListItem[]> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.includeInactive) searchParams.append('include_inactive', 'true');
    const query = searchParams.toString();
    return request(`/wines/${query ? `?${query}` : ''}`);
  },

  get: (id: number): Promise<Wine> =>
    request(`/wines/${id}/`),

  create: (data: CreateWinePayload): Promise<Wine> =>
    request('/wines/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateWinePayload>): Promise<Wine> =>
    request(`/wines/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<void> =>
    request(`/wines/${id}/`, {
      method: 'DELETE',
    }),

  types: (): Promise<WineTypeInfo[]> =>
    request('/wines/types/'),
};

// Draws API
export const drawsApi = {
  list: (includeVoided = false): Promise<DrawListItem[]> =>
    request(`/draws/?include_voided=${includeVoided}`),

  get: (id: number): Promise<Draw> =>
    request(`/draws/${id}/`),

  create: (data: CreateDrawPayload): Promise<Draw> =>
    request('/draws/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<CreateDrawPayload>): Promise<Draw> =>
    request(`/draws/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<void> =>
    request(`/draws/${id}/`, {
      method: 'DELETE',
    }),

  perform: (id: number, data: PerformDrawPayload = {}): Promise<Draw> =>
    request(`/draws/${id}/perform/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  preview: (id: number, data: PerformDrawPayload = {}): Promise<PreviewResult> =>
    request(`/draws/${id}/preview/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  void: (id: number): Promise<Draw> =>
    request(`/draws/${id}/void/`, {
      method: 'POST',
    }),
};

// Algorithms API
export const algorithmsApi = {
  list: (): Promise<Algorithm[]> =>
    request('/algorithms/'),
};

// Statistics API
export const statisticsApi = {
  get: (startDate?: string, endDate?: string): Promise<Statistics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString();
    return request(`/statistics/${query ? `?${query}` : ''}`);
  },

  exportUrl: (startDate?: string, endDate?: string): string => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString();
    return `${API_BASE}/statistics/export/${query ? `?${query}` : ''}`;
  },
};

// Vinmonopolet Search API
export const vinmonopoletApi = {
  search: (query: string, limit = 20): Promise<VinmonopoletSearchResult> =>
    request(`/vinmonopolet/search/?query=${encodeURIComponent(query)}&limit=${limit}`),
};

export { ApiError };
