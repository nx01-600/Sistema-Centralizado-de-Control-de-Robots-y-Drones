import api from './api';
import { 
  Dispositivo, 
  CreateDispositivoForm, 
  DispositivosStats,
  PaginatedResponse,
  ApiResponse 
} from '@/types';

export const dispositivosService = {
  // Obtener todos los dispositivos
  async getAll(params?: {
    tipo?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<PaginatedResponse<Dispositivo>>('/api/dispositivos', { params });
    return response.data;
  },

  // Obtener dispositivo por ID
  async getById(id: string) {
    const response = await api.get<Dispositivo>(`/api/dispositivos/${id}`);
    return response.data;
  },

  // Crear nuevo dispositivo
  async create(data: CreateDispositivoForm) {
    const response = await api.post<ApiResponse<Dispositivo>>('/api/dispositivos', data);
    return response.data;
  },

  // Actualizar dispositivo
  async update(id: string, data: Partial<Dispositivo>) {
    const response = await api.put<ApiResponse<Dispositivo>>(`/api/dispositivos/${id}`, data);
    return response.data;
  },

  // Eliminar dispositivo
  async delete(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/api/dispositivos/${id}`);
    return response.data;
  },

  // Verificar disponibilidad
  async checkAvailability(id: string) {
    const response = await api.get(`/api/dispositivos/${id}/disponibilidad`);
    return response.data;
  },

  // Actualizar batería
  async updateBattery(id: string, nivelBateria: number) {
    const response = await api.patch(`/api/dispositivos/${id}/bateria`, { nivelBateria });
    return response.data;
  },

  // Actualizar ubicación
  async updateLocation(id: string, ubicacion: string) {
    const response = await api.patch(`/api/dispositivos/${id}/ubicacion`, { ubicacion });
    return response.data;
  },

  // Obtener estadísticas
  async getStats() {
    const response = await api.get<DispositivosStats>('/api/dispositivos/estadisticas/resumen');
    return response.data;
  },

  // Obtener por tipo
  async getByType(tipo: string) {
    const response = await api.get<Dispositivo[]>(`/api/dispositivos/tipo/${tipo}`);
    return response.data;
  },

  // Obtener disponibles ahora
  async getAvailable() {
    const response = await api.get<Dispositivo[]>('/api/dispositivos/disponibles/ahora');
    return response.data;
  },
};