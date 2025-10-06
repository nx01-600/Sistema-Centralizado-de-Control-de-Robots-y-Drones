'use client';

import { useState, useEffect } from 'react';
import { Cpu, Plane, Battery, Wifi, MapPin, ArrowLeft, Plus, Eye, Trash2, Edit, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useNotifications } from '../../components/Notifications';

interface Dispositivo {
  id: string;
  nombre: string;
  tipo: 'robot' | 'drone';
  modelo: string;
  estado: 'disponible' | 'ocupado' | 'mantenimiento';
  ubicacionActual: string;
  nivelBateria: number;
  fechaCreacion: string;
}

export default function DispositivosPage() {
  const { showNotification } = useNotifications();
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Dispositivo | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'robot' as 'robot' | 'drone',
    modelo: '',
    estado: 'disponible' as 'disponible' | 'ocupado' | 'mantenimiento',
    ubicacionActual: '',
    nivelBateria: 100
  });

  useEffect(() => {
    loadDispositivos();
  }, []);

  const loadDispositivos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.dispositivos.getAll();
      const data = Array.isArray(response) ? response : [];
      console.log('Dispositivos cargados:', data);
      setDispositivos(data);
    } catch (err) {
      setError('Error al cargar dispositivos');
      console.error('Error:', err);
      setDispositivos([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'ocupado': return 'bg-yellow-100 text-yellow-800';
      case 'mantenimiento': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBateriaColor = (nivel: number) => {
    if (nivel > 50) return 'text-green-600';
    if (nivel > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleEdit = (dispositivo: Dispositivo) => {
    setEditingDevice(dispositivo);
    setFormData({
      nombre: dispositivo.nombre,
      tipo: dispositivo.tipo,
      modelo: dispositivo.modelo,
      estado: dispositivo.estado,
      ubicacionActual: dispositivo.ubicacionActual || '',
      nivelBateria: dispositivo.nivelBateria || 100
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
      return;
    }

    try {
      await api.dispositivos.delete(id);
      await loadDispositivos();
      showNotification({
        type: 'success',
        title: 'Dispositivo eliminado',
        message: 'El dispositivo ha sido eliminado exitosamente'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error al eliminar',
        message: 'No se pudo eliminar el dispositivo'
      });
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingDevice) {
        await api.dispositivos.update(editingDevice.id, formData);
        showNotification({
          type: 'success',
          title: 'Dispositivo actualizado',
          message: 'Los cambios han sido guardados exitosamente'
        });
      } else {
        await api.dispositivos.create(formData);
        showNotification({
          type: 'success',
          title: 'Dispositivo creado',
          message: 'El nuevo dispositivo ha sido registrado exitosamente'
        });
      }
      
      setShowModal(false);
      setEditingDevice(null);
      setFormData({
        nombre: '',
        tipo: 'robot',
        modelo: '',
        estado: 'disponible',
        ubicacionActual: '',
        nivelBateria: 100
      });
      await loadDispositivos();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudo guardar el dispositivo'
      });
      console.error('Error:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDevice(null);
    setFormData({
      nombre: '',
      tipo: 'robot',
      modelo: '',
      estado: 'disponible',
      ubicacionActual: '',
      nivelBateria: 100
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="spinner w-12 h-12 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando dispositivos...</p>
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
                Gestión de Dispositivos
              </h1>
              <p className="text-sm text-gray-600">
                Administra robots y drones del sistema
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
                onClick={loadDispositivos}
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
                {dispositivos.length}
              </p>
              <p className="text-sm text-gray-600">Total Dispositivos</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {dispositivos.filter(d => d.estado === 'disponible').length}
              </p>
              <p className="text-sm text-gray-600">Disponibles</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {dispositivos.filter(d => d.estado === 'ocupado').length}
              </p>
              <p className="text-sm text-gray-600">En Uso</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {dispositivos.filter(d => d.estado === 'mantenimiento').length}
              </p>
              <p className="text-sm text-gray-600">Mantenimiento</p>
            </div>
          </div>
        </div>

        {/* Add Device Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Lista de Dispositivos</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Dispositivo
          </button>
        </div>

        {/* Dispositivos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dispositivos.map((dispositivo) => (
            <div key={dispositivo.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {dispositivo.tipo === 'robot' ? (
                      <Cpu className="h-6 w-6 text-gray-700" />
                    ) : (
                      <Plane className="h-6 w-6 text-gray-700" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {dispositivo.nombre}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dispositivo.modelo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(dispositivo.estado)}`}>
                    {dispositivo.estado}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(dispositivo)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dispositivo.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {dispositivo.ubicacionActual || 'Ubicación no disponible'}
                </div>
                
                <div className="flex items-center text-sm">
                  <Battery className={`h-4 w-4 mr-2 ${getBateriaColor(dispositivo.nivelBateria || 0)}`} />
                  <span className={getBateriaColor(dispositivo.nivelBateria || 0)}>
                    Batería: {dispositivo.nivelBateria || 0}%
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Wifi className="h-4 w-4 mr-2" />
                  Tipo: {dispositivo.tipo.charAt(0).toUpperCase() + dispositivo.tipo.slice(1)}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  ID: {dispositivo.id}
                </p>
                <p className="text-xs text-gray-500">
                  Creado: {new Date(dispositivo.fechaCreacion).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {dispositivos.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Cpu className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay dispositivos registrados
            </h3>
            <p className="text-gray-600">
              Agrega algunos dispositivos para comenzar.
            </p>
          </div>
        )}

        {/* Modal para agregar/editar dispositivo */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingDevice ? 'Editar Dispositivo' : 'Agregar Dispositivo'}
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
                <div>
                  <label className="label">Nombre</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Robot-001"
                  />
                </div>

                <div>
                  <label className="label">Tipo</label>
                  <select
                    className="input"
                    title="Seleccionar tipo de dispositivo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({...formData, tipo: e.target.value as 'robot' | 'drone'})}
                  >
                    <option value="robot">Robot</option>
                    <option value="drone">Drone</option>
                  </select>
                </div>

                <div>
                  <label className="label">Modelo</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    placeholder="Ej: TurtleBot3 Burger"
                  />
                </div>

                <div>
                  <label className="label">Estado</label>
                  <select
                    className="input"
                    title="Seleccionar estado del dispositivo"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="ocupado">Ocupado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="label">Ubicación Actual</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.ubicacionActual}
                    onChange={(e) => setFormData({...formData, ubicacionActual: e.target.value})}
                    placeholder="Ej: Edificio Central, Piso 1"
                  />
                </div>

                <div>
                  <label className="label">Nivel de Batería (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input"
                    title="Nivel de batería"
                    placeholder="100"
                    value={formData.nivelBateria}
                    onChange={(e) => setFormData({...formData, nivelBateria: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingDevice ? 'Actualizar' : 'Crear'} Dispositivo
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