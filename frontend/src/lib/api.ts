// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Función utilitaria para hacer requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// API functions
export const api = {
  // Health check
  health: () => apiRequest<{ status: string; message: string; timestamp: string; version: string }>('/api/health'),
  
  // Dispositivos
  dispositivos: {
    getAll: async () => {
      const response = await apiRequest<{dispositivos: any[], pagination: any}>('/api/dispositivos');
      return response.dispositivos || [];
    },
    getById: (id: string) => apiRequest<any>(`/api/dispositivos/${id}`),
    create: (data: any) => apiRequest<any>('/api/dispositivos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/api/dispositivos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<any>(`/api/dispositivos/${id}`, {
      method: 'DELETE',
    }),
  },

  // Reservas
  reservas: {
    getAll: async () => {
      const response = await apiRequest<{reservas: any[], pagination: any}>('/api/reservas');
      return response.reservas || [];
    },
    getById: (id: string) => apiRequest<any>(`/api/reservas/${id}`),
    create: (data: any) => apiRequest<any>('/api/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/api/reservas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<any>(`/api/reservas/${id}`, {
      method: 'DELETE',
    }),
  },

  // Monitoreo
  monitoreo: {
    getAll: async () => {
      try {
        const response = await apiRequest<any>('/api/monitoreo');
        // Monitoreo podría devolver array directo o estructura con paginación
        return Array.isArray(response) ? response : (response.estados || response.monitoreo || []);
      } catch (error) {
        console.warn('Monitoreo API may return direct array:', error);
        return [];
      }
    },
    getByDispositivo: (dispositivoId: string) => apiRequest<any[]>(`/api/monitoreo/${dispositivoId}`),
    create: (data: any) => apiRequest<any>('/api/monitoreo', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  // Bitácoras
  bitacoras: {
    getAll: async () => {
      const response = await apiRequest<{bitacoras: any[], pagination: any}>('/api/bitacoras');
      return response.bitacoras || [];
    },
    getById: (id: string) => apiRequest<any>(`/api/bitacoras/${id}`),
    create: (data: any) => apiRequest<any>('/api/bitacoras', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/api/bitacoras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<any>(`/api/bitacoras/${id}`, {
      method: 'DELETE',
    }),
  },

  // Videos
  videos: {
    getAll: async () => {
      const response = await apiRequest<{videos: any[], pagination: any}>('/api/videos');
      return response.videos || [];
    },
    getById: (id: string) => apiRequest<any>(`/api/videos/${id}`),
    create: (data: any) => apiRequest<any>('/api/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<any>(`/api/videos/${id}`, {
      method: 'DELETE',
    }),
  },
};

export default api;