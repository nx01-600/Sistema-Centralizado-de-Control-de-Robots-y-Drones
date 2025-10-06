'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye, Trash2, Edit, X, Calendar, Clock, User, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { useNotifications } from '../../components/Notifications';

interface Reserva {
  id: string;
  dispositivoId: string;
  nombreSolicitante: string;
  emailSolicitante: string;
  proposito: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'pendiente' | 'activa' | 'completada' | 'cancelada';
  ubicacionDestino?: string;
  observaciones?: string;
  fechaCreacion: string;
  dispositivo?: {
    id: string;
    nombre: string;
    tipo: string;
    modelo: string;
  };
}

interface Dispositivo {
  id: string;
  nombre: string;
  tipo: string;
  modelo: string;
  estado: string;
}

export default function ReservasPage() {
  const { showNotification } = useNotifications();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [formData, setFormData] = useState({
    dispositivoId: '',
    nombreSolicitante: '',
    emailSolicitante: '',
    proposito: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'pendiente' as 'pendiente' | 'activa' | 'completada' | 'cancelada',
    ubicacionDestino: '',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reservasData, dispositivosData] = await Promise.all([
        api.reservas.getAll(),
        api.dispositivos.getAll()
      ]);
      
      setReservas(reservasData);
      setDispositivos(dispositivosData);
    } catch (err) {
      setError('Error al cargar datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'activa': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setFormData({
      dispositivoId: reserva.dispositivoId,
      nombreSolicitante: reserva.nombreSolicitante,
      emailSolicitante: reserva.emailSolicitante,
      proposito: reserva.proposito,
      fechaInicio: new Date(reserva.fechaInicio).toISOString().slice(0, 16),
      fechaFin: new Date(reserva.fechaFin).toISOString().slice(0, 16),
      estado: reserva.estado,
      ubicacionDestino: reserva.ubicacionDestino || '',
      observaciones: reserva.observaciones || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      return;
    }

    try {
      await api.reservas.delete(id);
      await loadData();
      showNotification({
        type: 'success',
        title: 'Reserva eliminada',
        message: 'La reserva ha sido eliminada exitosamente'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error al eliminar',
        message: 'No se pudo eliminar la reserva'
      });
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        fechaInicio: new Date(formData.fechaInicio).toISOString(),
        fechaFin: new Date(formData.fechaFin).toISOString()
      };

      if (editingReserva) {
        await api.reservas.update(editingReserva.id, submitData);
        showNotification({
          type: 'success',
          title: 'Reserva actualizada',
          message: 'Los cambios han sido guardados exitosamente'
        });
      } else {
        await api.reservas.create(submitData);
        showNotification({
          type: 'success',
          title: 'Reserva creada',
          message: 'La nueva reserva ha sido registrada exitosamente'
        });
      }
      
      closeModal();
      await loadData();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudo guardar la reserva'
      });
      console.error('Error:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReserva(null);
    setFormData({
      dispositivoId: '',
      nombreSolicitante: '',
      emailSolicitante: '',
      proposito: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'pendiente',
      ubicacionDestino: '',
      observaciones: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="spinner w-12 h-12 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reservas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <a 
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al inicio
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Reservas
              </h1>
              <p className="text-sm text-gray-600">
                Gestiona reservas de robots y drones
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button 
                onClick={loadData}
                className="ml-auto btn-primary text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reservas.length}
              </p>
              <p className="text-sm text-gray-600">Total Reservas</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {reservas.filter(r => r.estado === 'activa').length}
              </p>
              <p className="text-sm text-gray-600">Activas</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {reservas.filter(r => r.estado === 'pendiente').length}
              </p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {reservas.filter(r => r.estado === 'completada').length}
              </p>
              <p className="text-sm text-gray-600">Completadas</p>
            </div>
          </div>
        </div>

        {/* Add Reservation Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Lista de Reservas</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </button>
        </div>

        {/* Reservas List */}
        <div className="space-y-4">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {reserva.dispositivo?.nombre || 'Dispositivo no encontrado'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {reserva.dispositivo?.tipo} - {reserva.dispositivo?.modelo}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>{reserva.nombreSolicitante}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(reserva.fechaInicio).toLocaleDateString()} - {new Date(reserva.fechaFin).toLocaleDateString()}
                      </span>
                    </div>
                    {reserva.ubicacionDestino && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{reserva.ubicacionDestino}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Propósito:</span>
                      <span>{reserva.proposito}</span>
                    </div>
                  </div>

                  {reserva.observaciones && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Observaciones:</strong> {reserva.observaciones}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(reserva)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(reserva.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reservas.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay reservas registradas
            </h3>
            <p className="text-gray-600 mb-4">
              Crea la primera reserva para comenzar.
            </p>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Nueva Reserva
            </button>
          </div>
        )}

        {/* Modal para agregar/editar reserva */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                  title="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Dispositivo</label>
                    <select
                      required
                      className="input"
                      title="Seleccionar dispositivo"
                      value={formData.dispositivoId}
                      onChange={(e) => setFormData({...formData, dispositivoId: e.target.value})}
                    >
                      <option value="">Seleccionar dispositivo</option>
                      {dispositivos.filter(d => d.estado === 'disponible').map(dispositivo => (
                        <option key={dispositivo.id} value={dispositivo.id}>
                          {dispositivo.nombre} ({dispositivo.tipo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Estado</label>
                    <select
                      className="input"
                      title="Seleccionar estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="activa">Activa</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre del Solicitante</label>
                    <input
                      type="text"
                      required
                      className="input"
                      value={formData.nombreSolicitante}
                      onChange={(e) => setFormData({...formData, nombreSolicitante: e.target.value})}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="label">Email del Solicitante</label>
                    <input
                      type="email"
                      required
                      className="input"
                      value={formData.emailSolicitante}
                      onChange={(e) => setFormData({...formData, emailSolicitante: e.target.value})}
                      placeholder="juan.perez@ejemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Propósito</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.proposito}
                    onChange={(e) => setFormData({...formData, proposito: e.target.value})}
                    placeholder="Investigación, clase, proyecto, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Fecha y Hora de Inicio</label>
                    <input
                      type="datetime-local"
                      required
                      className="input"
                      title="Seleccionar fecha y hora de inicio"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="label">Fecha y Hora de Fin</label>
                    <input
                      type="datetime-local"
                      required
                      className="input"
                      title="Seleccionar fecha y hora de fin"
                      value={formData.fechaFin}
                      onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Ubicación de Destino (Opcional)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.ubicacionDestino}
                    onChange={(e) => setFormData({...formData, ubicacionDestino: e.target.value})}
                    placeholder="Edificio Central, Laboratorio A, etc."
                  />
                </div>

                <div>
                  <label className="label">Observaciones (Opcional)</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    placeholder="Instrucciones especiales, notas adicionales..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingReserva ? 'Actualizar' : 'Crear'} Reserva
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}