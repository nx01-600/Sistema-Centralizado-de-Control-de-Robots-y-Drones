import api from './api';
import { 
  Reserva, 
  CreateReservaForm, 
  ReservasStats,
  PaginatedResponse,
  ApiResponse 
} from '@/types';

export const reservasService = {
  // Obtener todas las reservas
  async getAll(params?: {
    estado?: string;
    dispositivoId?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<PaginatedResponse<Reserva>>('/api/reservas', { params });
    return response.data;
  },

  // Obtener reserva por ID
  async getById(id: string) {
    const response = await api.get<Reserva>(`/api/reservas/${id}`);
    return response.data;
  },

  // Crear nueva reserva
  async create(data: CreateReservaForm) {
    const response = await api.post<ApiResponse<Reserva>>('/api/reservas', data);
    return response.data;
  },

  // Actualizar reserva
  async update(id: string, data: Partial<Reserva>) {
    const response = await api.put<ApiResponse<Reserva>>(`/api/reservas/${id}`, data);
    return response.data;
  },

  // Cancelar reserva
  async cancel(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/api/reservas/${id}`);
    return response.data;
  },

  // Cambiar estado
  async changeStatus(id: string, estado: string) {
    const response = await api.patch(`/api/reservas/${id}/estado`, { estado });
    return response.data;
  },

  // Obtener reservas por dispositivo
  async getByDevice(dispositivoId: string) {
    const response = await api.get<Reserva[]>(`/api/reservas/dispositivo/${dispositivoId}`);
    return response.data;
  },

  // Obtener estadísticas
  async getStats() {
    const response = await api.get<ReservasStats>('/api/reservas/estadisticas/resumen');
    return response.data;
  },

  // Verificar conflictos
  async checkConflicts(dispositivoId: string, fechaInicio: string, fechaFin: string) {
    const response = await api.get(`/api/reservas/conflictos/${dispositivoId}`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },
};