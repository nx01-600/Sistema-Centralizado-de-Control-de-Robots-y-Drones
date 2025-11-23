'use client';

import { useState, useEffect, useCallback } from 'react';

// Tipos
interface Dispositivo {
  id: string;
  nombre: string;
  tipo: 'ROBOT' | 'DRONE';
  identificador: string;
  ubicacion: string;
  nivelBateria: number;
  estado: 'DISPONIBLE' | 'EN_USO' | 'EN_MANTENIMIENTO' | 'EN_CARGA';
}

interface Reserva {
  id: string;
  dispositivoId: string;
  fechaSalida: string;
  horaSalida: string;
  fechaRegreso: string;
  horaRegreso: string;
  solicitadoPor: string;
  tipoServicio: string;
  ubicacionOrigen?: string;
  ubicacionDestino?: string;
  observaciones?: string;
  dispositivo?: Dispositivo;
}

interface Metrica {
  id: string;
  dispositivoId: string;
  temperatura?: number;
  humedad?: number;
  velocidad?: number;
  altitud?: number;
  tiempoVuelo: number;
  horasTotales: number;
  distanciaTotal: number;
  fecha: string;
  dispositivo?: Dispositivo;
}

interface HealthCheck {
  status: string;
  database: string;
  message: string;
  timestamp: string;
}

interface ApiTest {
  endpoint: string;
  method: string;
  status: number | null;
  responseTime: number | null;
  success: boolean;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'dispositivos' | 'reservas' | 'metricas' | 'verificacion'>('dispositivos');
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [metricas, setMetricas] = useState<Metrica[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para verificación técnica
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [apiTests, setApiTests] = useState<ApiTest[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);

  // Estados para formularios
  const [showDispositivoForm, setShowDispositivoForm] = useState(false);
  const [showReservaForm, setShowReservaForm] = useState(false);
  const [showMetricaForm, setShowMetricaForm] = useState(false);
  const [editingDispositivo, setEditingDispositivo] = useState<Dispositivo | null>(null);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  
  // Estado para modal de detalles
  const [dispositivoDetalle, setDispositivoDetalle] = useState<Dispositivo | null>(null);
  const [modoEdicionModal, setModoEdicionModal] = useState(false);

  // Formulario dispositivo
  const [dispositivoForm, setDispositivoForm] = useState({
    nombre: '',
    tipo: 'ROBOT' as 'ROBOT' | 'DRONE',
    identificador: '',
    ubicacion: '',
    nivelBateria: 100,
    estado: 'DISPONIBLE' as 'DISPONIBLE' | 'EN_USO' | 'EN_MANTENIMIENTO' | 'EN_CARGA'
  });

  // Formulario reserva
  const [reservaForm, setReservaForm] = useState({
    id: '' as string | undefined,
    dispositivoId: '',
    fechaSalida: '',
    horaSalida: '',
    fechaRegreso: '',
    horaRegreso: '',
    solicitadoPor: '',
    tipoServicio: 'TRANSPORTE' as string
  });

  // Formulario métrica
  const [metricaForm, setMetricaForm] = useState({
    dispositivoId: '',
    temperatura: 0,
    humedad: 0,
    velocidad: 0,
    altitud: 0,
    tiempoVuelo: 0,
    horasTotales: 0,
    distanciaTotal: 0,
    fecha: new Date().toISOString().split('T')[0]
  });

  // Sistema de notificaciones
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  }>({ message: '', type: 'success', show: false });

  const mostrarNotificacion = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // REQF.1: Función para actualizar datos
  const actualizarDatos = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'dispositivos') {
        const res = await fetch(`${API_URL}/api/dispositivos`);
        const data = await res.json();
        setDispositivos(data);
      } else if (activeTab === 'reservas') {
        const res = await fetch(`${API_URL}/api/reservas`);
        const data = await res.json();
        setReservas(data);
      } else if (activeTab === 'metricas') {
        const res = await fetch(`${API_URL}/api/metricas`);
        const data = await res.json();
        setMetricas(data);
      } else if (activeTab === 'verificacion') {
        await ejecutarVerificacion();
      }
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      mostrarNotificacion('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Función para verificación técnica
  const ejecutarVerificacion = useCallback(async () => {
    // 1. Health Check
    try {
      const startHealth = Date.now();
      const healthRes = await fetch(`${API_URL}/health`);
      const healthData = await healthRes.json();
      setHealthCheck(healthData);
    } catch (error) {
      setHealthCheck({
        status: 'ERROR',
        database: 'Desconocido',
        message: 'No se pudo conectar con el backend',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Pruebas de endpoints
    const endpoints = [
      { endpoint: '/api/dispositivos', method: 'GET' },
      { endpoint: '/api/reservas', method: 'GET' },
      { endpoint: '/api/metricas', method: 'GET' }
    ];

    const tests: ApiTest[] = [];
    for (const ep of endpoints) {
      const start = Date.now();
      try {
        const res = await fetch(`${API_URL}${ep.endpoint}`);
        const responseTime = Date.now() - start;
        tests.push({
          endpoint: ep.endpoint,
          method: ep.method,
          status: res.status,
          responseTime,
          success: res.ok
        });
      } catch (error) {
        tests.push({
          endpoint: ep.endpoint,
          method: ep.method,
          status: null,
          responseTime: null,
          success: false,
          error: 'Error de conexión'
        });
      }
    }
    setApiTests(tests);

    // 3. Estadísticas de base de datos
    try {
      const [dispRes, resRes, metRes] = await Promise.all([
        fetch(`${API_URL}/api/dispositivos`),
        fetch(`${API_URL}/api/reservas`),
        fetch(`${API_URL}/api/metricas`)
      ]);
      const [dispData, resData, metData] = await Promise.all([
        dispRes.json(),
        resRes.json(),
        metRes.json()
      ]);
      
      setDbStats({
        dispositivos: dispData.length,
        reservas: resData.length,
        metricas: metData.length,
        total: dispData.length + resData.length + metData.length
      });
    } catch (error) {
      setDbStats(null);
    }
  }, []);

  // Cargar datos al cambiar de tab
  useEffect(() => {
    actualizarDatos();
  }, [actualizarDatos]);

  // ============================================
  // FUNCIONES CRUD - DISPOSITIVOS
  // ============================================

  const crearDispositivo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dispositivos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispositivoForm)
      });
      
      if (res.ok) {
        mostrarNotificacion('Dispositivo creado exitosamente', 'success');
        setShowDispositivoForm(false);
        resetDispositivoForm();
        actualizarDatos();
      } else {
        mostrarNotificacion('Error al crear dispositivo', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
  };

  const editarDispositivo = async () => {
    if (!editingDispositivo) return;
    
    try {
      const res = await fetch(`${API_URL}/api/dispositivos/${editingDispositivo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispositivoForm)
      });
      
      if (res.ok) {
        mostrarNotificacion('Dispositivo actualizado exitosamente', 'success');
        setShowDispositivoForm(false);
        setEditingDispositivo(null);
        resetDispositivoForm();
        actualizarDatos();
      } else {
        mostrarNotificacion('Error al actualizar dispositivo', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
  };

  const eliminarDispositivo = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este dispositivo?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/dispositivos/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        mostrarNotificacion('Dispositivo eliminado exitosamente', 'success');
        actualizarDatos();
      } else {
        mostrarNotificacion('Error al eliminar dispositivo', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
  };

  const abrirFormularioDispositivo = (dispositivo?: Dispositivo) => {
    if (dispositivo) {
      setEditingDispositivo(dispositivo);
      setDispositivoForm({
        nombre: dispositivo.nombre,
        tipo: dispositivo.tipo,
        identificador: dispositivo.identificador,
        ubicacion: dispositivo.ubicacion,
        nivelBateria: dispositivo.nivelBateria,
        estado: dispositivo.estado
      });
    } else {
      setEditingDispositivo(null);
      resetDispositivoForm();
    }
    setShowDispositivoForm(true);
  };

  const resetDispositivoForm = () => {
    setDispositivoForm({
      nombre: '',
      tipo: 'ROBOT',
      identificador: '',
      ubicacion: '',
      nivelBateria: 100,
      estado: 'DISPONIBLE'
    });
  };

  // ============================================
  // FUNCIONES CRUD - RESERVAS (solo CREATE y DELETE - inmutable)
  // ============================================

  const crearReserva = async () => {
    try {
      const isEditing = !!reservaForm.id;
      const url = isEditing 
        ? `${API_URL}/api/reservas/${reservaForm.id}` 
        : `${API_URL}/api/reservas`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const { id, ...dataToSend } = reservaForm;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (res.ok) {
        mostrarNotificacion(
          isEditing ? 'Reserva actualizada exitosamente' : 'Reserva registrada exitosamente', 
          'success'
        );
        setShowReservaForm(false);
        resetReservaForm();
        actualizarDatos();
      } else {
        mostrarNotificacion(
          isEditing ? 'Error al actualizar reserva' : 'Error al registrar reserva', 
          'error'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
  };

  const eliminarReserva = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta reserva?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/reservas/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        mostrarNotificacion('Reserva eliminada exitosamente', 'success');
        actualizarDatos();
      } else {
        mostrarNotificacion('Error al eliminar reserva', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
  };

  const abrirFormularioReserva = () => {
    setShowReservaForm(true);
    resetReservaForm();
  };

  const resetReservaForm = () => {
    setReservaForm({
      id: undefined,
      dispositivoId: '',
      fechaSalida: '',
      horaSalida: '',
      fechaRegreso: '',
      horaRegreso: '',
      solicitadoPor: '',
      tipoServicio: 'TRANSPORTE'
    });
  };

  // ============================================
  // FUNCIONES CRUD - MÉTRICAS
  // ============================================

  const crearMetrica = async () => {
    try {
      const res = await fetch(`${API_URL}/api/metricas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricaForm)
      });
      
      if (res.ok) {
        mostrarNotificacion('Métrica registrada exitosamente', 'success');
        setShowMetricaForm(false);
        resetMetricaForm();
        actualizarDatos();
      } else {
        mostrarNotificacion('Error al registrar métrica', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al conectar con el servidor', 'error');
    }
  };

  const resetMetricaForm = () => {
    setMetricaForm({
      dispositivoId: '',
      temperatura: 0,
      humedad: 0,
      velocidad: 0,
      altitud: 0,
      tiempoVuelo: 0,
      horasTotales: 0,
      distanciaTotal: 0,
      fecha: new Date().toISOString().split('T')[0]
    });
  };

  // Exportar métricas a CSV
  const exportarCSV = () => {
    const headers = ['Dispositivo', 'Fecha', 'Temperatura', 'Humedad', 'Velocidad', 'Altitud', 'Tiempo Vuelo', 'Horas Totales', 'Distancia Total'];
    const rows = metricas.map(m => [
      m.dispositivo?.nombre || m.dispositivoId,
      new Date(m.fecha).toLocaleDateString('es-CO'),
      m.temperatura ? `${m.temperatura.toFixed(1)}°C` : 'N/A',
      m.humedad ? `${m.humedad.toFixed(1)}%` : 'N/A',
      m.velocidad ? `${m.velocidad.toFixed(1)} m/s` : 'N/A',
      m.altitud ? `${m.altitud.toFixed(1)} m` : 'N/A',
      `${m.tiempoVuelo} min`,
      `${m.horasTotales.toFixed(1)} h`,
      `${m.distanciaTotal.toFixed(2)} km`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `metricas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    mostrarNotificacion('Métricas exportadas a CSV exitosamente', 'success');
  };

  // Exportar métricas a PDF
  const exportarPDF = () => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Métricas de Dispositivos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e40af; text-align: center; }
          h2 { color: #374151; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
          th { background-color: #1e40af; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Sistema de Gestión de Robots y Drones</h1>
        <h2>Reporte de Métricas de Uso</h2>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-CO')}</p>
        <p><strong>Total de registros:</strong> ${metricas.length}</p>
        <table>
          <thead>
            <tr>
              <th>Dispositivo</th>
              <th>Fecha</th>
              <th>Temperatura</th>
              <th>Humedad</th>
              <th>Velocidad</th>
              <th>Altitud</th>
              <th>Tiempo Vuelo</th>
              <th>Horas Totales</th>
              <th>Distancia Total</th>
            </tr>
          </thead>
          <tbody>
            ${metricas.map(m => `
              <tr>
                <td>${m.dispositivo?.nombre || m.dispositivoId}</td>
                <td>${new Date(m.fecha).toLocaleDateString('es-CO')}</td>
                <td>${m.temperatura ? `${m.temperatura.toFixed(1)}°C` : 'N/A'}</td>
                <td>${m.humedad ? `${m.humedad.toFixed(1)}%` : 'N/A'}</td>
                <td>${m.velocidad ? `${m.velocidad.toFixed(1)} m/s` : 'N/A'}</td>
                <td>${m.altitud ? `${m.altitud.toFixed(1)} m` : 'N/A'}</td>
                <td>${m.tiempoVuelo} min</td>
                <td>${m.horasTotales.toFixed(1)} h</td>
                <td>${m.distanciaTotal.toFixed(2)} km</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Pontificia Universidad Javeriana Cali</p>
          <p>Sistema de Control de Robots y Drones</p>
        </div>
      </body>
      </html>
    `;

    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      setTimeout(() => {
        ventana.print();
      }, 250);
      mostrarNotificacion('Abriendo vista previa para imprimir/guardar como PDF', 'info');
    }
  };

  // Función para abrir Prisma Studio
  const abrirPrismaStudio = async () => {
    try {
      const res = await fetch(`${API_URL}/api/prisma/studio`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.success) {
        mostrarNotificacion('Prisma Studio iniciado en http://localhost:5555', 'info');
        setTimeout(() => {
          window.open('http://localhost:5555', '_blank');
        }, 1000);
      }
    } catch (error) {
      console.error('Error al abrir Prisma Studio:', error);
      mostrarNotificacion('Error al abrir Prisma Studio. Asegúrate de que el backend esté en ejecución.', 'error');
    }
  };

  // Función para formatear estado
  const getEstadoClass = (estado: string) => {
    const map: Record<string, string> = {
      'DISPONIBLE': 'badge-disponible',
      'EN_USO': 'badge-en-uso',
      'EN_MANTENIMIENTO': 'badge-mantenimiento',
      'EN_CARGA': 'badge-carga'
    };
    return map[estado] || 'badge';
  };

  const getEstadoLabel = (estado: string) => {
    const map: Record<string, string> = {
      'DISPONIBLE': 'Disponible',
      'EN_USO': 'En Uso',
      'EN_MANTENIMIENTO': 'En Mantenimiento',
      'EN_CARGA': 'En Carga'
    };
    return map[estado] || estado;
  };

  return (
    <div>
      {/* Sistema de notificaciones */}
      {notification.show && (
        <div className={`notification-container notification-${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✗' : 'ℹ'}
            </span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Título principal */}
      <div className="section-header">
        <h2 className="section-title">Panel de Control</h2>
        {/* REQF.1: Botón Actualizar */}
        <button 
          className="btn-actualizar" 
          onClick={actualizarDatos}
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* REQNF.3: Navegación en una sola pestaña */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'dispositivos' ? 'active' : ''}`}
          onClick={() => setActiveTab('dispositivos')}
        >
          Gestión de dispositivos
        </button>
        <button 
          className={`nav-tab ${activeTab === 'reservas' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservas')}
        >
          Bitácora
        </button>
        <button 
          className={`nav-tab ${activeTab === 'metricas' ? 'active' : ''}`}
          onClick={() => setActiveTab('metricas')}
        >
          Métricas
        </button>
        <button 
          className={`nav-tab ${activeTab === 'verificacion' ? 'active' : ''}`}
          onClick={() => setActiveTab('verificacion')}
        >
          Verificación Técnica
        </button>
      </div>

      {/* REQF.2: Módulo de gestión de dispositivos */}
      {activeTab === 'dispositivos' && (
        <div className="card">
          <div className="section-header-with-button">
            <h3 className="subsection-title">Gestión de dispositivos</h3>
            <button 
              className="btn-create" 
              onClick={() => abrirFormularioDispositivo()}
            >
              + Crear Nuevo Dispositivo
            </button>
          </div>

          {/* Formulario de Dispositivo */}
          {showDispositivoForm && (
            <div className="form-container">
              <h4>{editingDispositivo ? 'Editar Dispositivo' : 'Crear Nuevo Dispositivo'}</h4>
              <div className="form-grid-2">
                <div>
                  <label className="form-label">Nombre:</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={dispositivoForm.nombre}
                    onChange={(e) => setDispositivoForm({...dispositivoForm, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Tipo:</label>
                  <select 
                    className="form-input"
                    value={dispositivoForm.tipo}
                    onChange={(e) => setDispositivoForm({...dispositivoForm, tipo: e.target.value as any})}
                  >
                    <option value="ROBOT">ROBOT</option>
                    <option value="DRONE">DRONE</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Identificador:</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={dispositivoForm.identificador}
                    onChange={(e) => setDispositivoForm({...dispositivoForm, identificador: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Ubicación:</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={dispositivoForm.ubicacion}
                    onChange={(e) => setDispositivoForm({...dispositivoForm, ubicacion: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Nivel de Batería (%):</label>
                  <input 
                    type="number" 
                    className="form-input"
                    min="0" 
                    max="100"
                    value={dispositivoForm.nivelBateria}
                    onChange={(e) => setDispositivoForm({...dispositivoForm, nivelBateria: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="form-label">Estado:</label>
                  <select 
                    className="form-input"
                    value={dispositivoForm.estado}
                    onChange={(e) => setDispositivoForm({...dispositivoForm, estado: e.target.value as any})}
                  >
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="EN_USO">EN USO</option>
                    <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                    <option value="EN_CARGA">EN CARGA</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="btn-create" 
                  onClick={editingDispositivo ? editarDispositivo : crearDispositivo}
                >
                  {editingDispositivo ? 'Guardar Cambios' : 'Crear Dispositivo'}
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowDispositivoForm(false);
                    setEditingDispositivo(null);
                    resetDispositivoForm();
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Identificador</th>
                  <th>Ubicación</th>
                  <th>Nivel de Batería</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {dispositivos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      {loading ? 'Cargando...' : 'No hay dispositivos registrados'}
                    </td>
                  </tr>
                ) : (
                  dispositivos.map((dispositivo) => (
                    <tr key={dispositivo.id}>
                      <td>{dispositivo.nombre}</td>
                      <td>
                        <span className={`badge ${dispositivo.tipo === 'ROBOT' ? 'badge-robot' : 'badge-drone'}`}>
                          {dispositivo.tipo}
                        </span>
                      </td>
                      <td>{dispositivo.identificador}</td>
                      <td>{dispositivo.ubicacion}</td>
                      <td>
                        <div className="battery-container">
                          <div className="battery-bar">
                            <div 
                              className="battery-fill"
                              style={{
                                width: `${dispositivo.nivelBateria}%`,
                                backgroundColor: dispositivo.nivelBateria > 50 ? '#10b981' : dispositivo.nivelBateria > 20 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="battery-text">
                            {dispositivo.nivelBateria}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoClass(dispositivo.estado)}`}>
                          {getEstadoLabel(dispositivo.estado)}
                        </span>
                      </td>
                      <td>
                        <div className="actions-container">
                          <button 
                            onClick={() => setDispositivoDetalle(dispositivo)}
                            style={{ 
                              padding: '6px 14px', 
                              backgroundColor: '#10b981', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '5px', 
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                          >
                            Ver Detalles
                          </button>
                          <button 
                            onClick={() => eliminarDispositivo(dispositivo.id)}
                            style={{ 
                              padding: '6px 14px', 
                              backgroundColor: '#dc3545', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '5px', 
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQF.3: Módulo de bitácora de reservas */}
      {activeTab === 'reservas' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="subsection-title">Bitácora</h3>
            <button 
              className="btn-primary" 
              onClick={() => abrirFormularioReserva()}
              style={{ padding: '10px 20px', backgroundColor: 'var(--color-azul-primario)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Registrar Nueva Reserva
            </button>
          </div>

          {/* Formulario de Reserva */}
          {showReservaForm && (
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '2px solid var(--color-azul-primario)'
            }}>
              <h4>{reservaForm.id ? 'Editar Reserva' : 'Registrar Nueva Reserva'}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dispositivo:</label>
                  <select 
                    value={reservaForm.dispositivoId}
                    onChange={(e) => setReservaForm({...reservaForm, dispositivoId: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">Seleccione un dispositivo</option>
                    {dispositivos.map(d => (
                      <option key={d.id} value={d.id}>{d.identificador} - {d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tipo de Servicio:</label>
                  <select 
                    value={reservaForm.tipoServicio}
                    onChange={(e) => setReservaForm({...reservaForm, tipoServicio: e.target.value as any})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="TRANSPORTE">TRANSPORTE</option>
                    <option value="VIGILANCIA">VIGILANCIA</option>
                    <option value="INVESTIGACION">INVESTIGACION</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Salida:</label>
                  <input 
                    type="date" 
                    value={reservaForm.fechaSalida}
                    onChange={(e) => setReservaForm({...reservaForm, fechaSalida: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora de Salida:</label>
                  <input 
                    type="time" 
                    value={reservaForm.horaSalida}
                    onChange={(e) => setReservaForm({...reservaForm, horaSalida: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Regreso:</label>
                  <input 
                    type="date" 
                    value={reservaForm.fechaRegreso}
                    onChange={(e) => setReservaForm({...reservaForm, fechaRegreso: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora de Regreso:</label>
                  <input 
                    type="time" 
                    value={reservaForm.horaRegreso}
                    onChange={(e) => setReservaForm({...reservaForm, horaRegreso: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Solicitado Por:</label>
                  <input 
                    type="text" 
                    value={reservaForm.solicitadoPor}
                    onChange={(e) => setReservaForm({...reservaForm, solicitadoPor: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="btn-primary" 
                  onClick={crearReserva}
                  style={{ padding: '10px 20px', backgroundColor: 'var(--color-azul-primario)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {reservaForm.id ? 'Actualizar Reserva' : 'Registrar Reserva'}
                </button>
                <button 
                  onClick={() => {
                    setShowReservaForm(false);
                    resetReservaForm();
                  }}
                  style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Identificador del Dispositivo</th>
                  <th>Fecha de Salida</th>
                  <th>Hora de Salida</th>
                  <th>Fecha de Regreso</th>
                  <th>Hora de Regreso</th>
                  <th>Solicitado Por</th>
                  <th>Tipo Servicio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center">
                      {loading ? 'Cargando...' : 'No hay reservas registradas'}
                    </td>
                  </tr>
                ) : (
                  reservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td>{reserva.dispositivo?.identificador || reserva.dispositivoId}</td>
                      <td>{new Date(reserva.fechaSalida).toLocaleDateString('es-CO')}</td>
                      <td>{reserva.horaSalida}</td>
                      <td>{new Date(reserva.fechaRegreso).toLocaleDateString('es-CO')}</td>
                      <td>{reserva.horaRegreso}</td>
                      <td>{reserva.solicitadoPor}</td>
                      <td>{reserva.tipoServicio}</td>
                      <td>
                        <div className="actions-container">
                          <button 
                            onClick={() => {
                              setReservaForm({
                                id: reserva.id,
                                dispositivoId: reserva.dispositivoId,
                                fechaSalida: reserva.fechaSalida.split('T')[0],
                                horaSalida: reserva.horaSalida,
                                fechaRegreso: reserva.fechaRegreso.split('T')[0],
                                horaRegreso: reserva.horaRegreso,
                                solicitadoPor: reserva.solicitadoPor,
                                tipoServicio: reserva.tipoServicio
                              });
                              setShowReservaForm(true);
                            }}
                            style={{ 
                              padding: '6px 14px', 
                              backgroundColor: '#ffc107', 
                              color: '#000', 
                              border: 'none', 
                              borderRadius: '5px', 
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                              marginRight: '8px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0a800'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffc107'}
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => eliminarReserva(reserva.id)}
                            style={{ 
                              padding: '6px 14px', 
                              backgroundColor: '#dc3545', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '5px', 
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQF.4: Módulo de métricas de uso */}
      {activeTab === 'metricas' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="subsection-title">Métricas</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-export" 
                onClick={exportarCSV}
                disabled={metricas.length === 0}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: metricas.length === 0 ? '#ccc' : '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: metricas.length === 0 ? 'not-allowed' : 'pointer', 
                  fontWeight: 'bold'
                }}
              >
                Exportar CSV
              </button>
              <button 
                className="btn-export" 
                onClick={exportarPDF}
                disabled={metricas.length === 0}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: metricas.length === 0 ? '#ccc' : '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: metricas.length === 0 ? 'not-allowed' : 'pointer', 
                  fontWeight: 'bold'
                }}
              >
                Exportar PDF
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setShowMetricaForm(true);
                  resetMetricaForm();
                }}
                style={{ padding: '10px 20px', backgroundColor: 'var(--color-azul-primario)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                + Registrar Nueva Métrica
              </button>
            </div>
          </div>

          {/* Formulario de Métrica */}
          {showMetricaForm && (
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '2px solid var(--color-azul-primario)'
            }}>
              <h4>Registrar Nueva Métrica</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dispositivo:</label>
                  <select 
                    value={metricaForm.dispositivoId}
                    onChange={(e) => setMetricaForm({...metricaForm, dispositivoId: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">Seleccione un dispositivo</option>
                    {dispositivos.map(d => (
                      <option key={d.id} value={d.id}>{d.identificador} - {d.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Temperatura (°C):</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={metricaForm.temperatura}
                    onChange={(e) => setMetricaForm({...metricaForm, temperatura: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Humedad (%):</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={metricaForm.humedad}
                    onChange={(e) => setMetricaForm({...metricaForm, humedad: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Velocidad (m/s):</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={metricaForm.velocidad}
                    onChange={(e) => setMetricaForm({...metricaForm, velocidad: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Altitud (m):</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={metricaForm.altitud}
                    onChange={(e) => setMetricaForm({...metricaForm, altitud: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tiempo Vuelo (min):</label>
                  <input 
                    type="number" 
                    value={metricaForm.tiempoVuelo}
                    onChange={(e) => setMetricaForm({...metricaForm, tiempoVuelo: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Horas Totales:</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={metricaForm.horasTotales}
                    onChange={(e) => setMetricaForm({...metricaForm, horasTotales: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Distancia Total (km):</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={metricaForm.distanciaTotal}
                    onChange={(e) => setMetricaForm({...metricaForm, distanciaTotal: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha:</label>
                  <input 
                    type="date" 
                    value={metricaForm.fecha}
                    onChange={(e) => setMetricaForm({...metricaForm, fecha: e.target.value})}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="btn-primary" 
                  onClick={crearMetrica}
                  style={{ padding: '10px 20px', backgroundColor: 'var(--color-azul-primario)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Registrar Métrica
                </button>
                <button 
                  onClick={() => {
                    setShowMetricaForm(false);
                    resetMetricaForm();
                  }}
                  style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Dispositivo</th>
                  <th>Fecha</th>
                  <th>Temperatura</th>
                  <th>Humedad</th>
                  <th>Velocidad</th>
                  <th>Altitud</th>
                  <th>Tiempo Vuelo</th>
                  <th>Horas Totales</th>
                  <th>Distancia Total</th>
                </tr>
              </thead>
              <tbody>
                {metricas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center">
                      {loading ? 'Cargando...' : 'No hay métricas registradas'}
                    </td>
                  </tr>
                ) : (
                  metricas.map((metrica) => (
                    <tr key={metrica.id}>
                      <td>{metrica.dispositivo?.nombre || metrica.dispositivoId}</td>
                      <td>{new Date(metrica.fecha).toLocaleDateString('es-CO')}</td>
                      <td>{metrica.temperatura ? `${metrica.temperatura.toFixed(1)}°C` : 'N/A'}</td>
                      <td>{metrica.humedad ? `${metrica.humedad.toFixed(1)}%` : 'N/A'}</td>
                      <td>{metrica.velocidad ? `${metrica.velocidad.toFixed(1)} m/s` : 'N/A'}</td>
                      <td>{metrica.altitud ? `${metrica.altitud.toFixed(1)} m` : 'N/A'}</td>
                      <td>{metrica.tiempoVuelo} min</td>
                      <td>{metrica.horasTotales.toFixed(1)} h</td>
                      <td>{metrica.distanciaTotal.toFixed(2)} km</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Módulo de verificación técnica */}
      {activeTab === 'verificacion' && (
        <div>
          {/* Health Check */}
          <div className="card card-spacing">
            <h3 className="mb-3 subsection-title">
              Estado del Sistema
            </h3>
            {healthCheck ? (
              <div className="grid-stats">
                <div className="stat-card">
                  <div className="stat-label">Estado del Backend</div>
                  <div className={`stat-value ${healthCheck.status === 'OK' ? 'success' : 'error'}`}>
                    {healthCheck.status}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Base de Datos</div>
                  <div className={`stat-value ${healthCheck.database === 'Connected' ? 'success' : 'error'}`}>
                    {healthCheck.database}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Última Verificación</div>
                  <div className="stat-value small">
                    {new Date(healthCheck.timestamp).toLocaleTimeString('es-CO')}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center">{loading ? 'Verificando...' : 'Presiona "Actualizar Datos" para verificar'}</p>
            )}
          </div>

          {/* Pruebas de API */}
          <div className="card card-spacing">
            <h3 className="mb-3 subsection-title">
              Pruebas de Endpoints de la API
            </h3>
            {apiTests.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Endpoint</th>
                      <th>Método</th>
                      <th>Código de Estado</th>
                      <th>Tiempo de Respuesta</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiTests.map((test, idx) => (
                      <tr key={idx}>
                        <td><code>{test.endpoint}</code></td>
                        <td><span className="badge badge-en-uso">{test.method}</span></td>
                        <td>
                          {test.status ? (
                            <span className={`badge ${test.status === 200 ? 'badge-disponible' : 'badge-mantenimiento'}`}>
                              {test.status}
                            </span>
                          ) : (
                            <span className="badge badge-mantenimiento">ERROR</span>
                          )}
                        </td>
                        <td>{test.responseTime ? `${test.responseTime} ms` : 'N/A'}</td>
                        <td>
                          {test.success ? (
                            <span className="badge badge-disponible">EXITOSO</span>
                          ) : (
                            <span className="badge badge-mantenimiento">{test.error || 'FALLIDO'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center">{loading ? 'Ejecutando pruebas...' : 'Presiona "Actualizar Datos" para ejecutar pruebas'}</p>
            )}
          </div>

          {/* Estadísticas de Base de Datos */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="subsection-title">
                Estadísticas de la Base de Datos (Prisma)
              </h3>
              <button 
                className="btn-primary" 
                onClick={abrirPrismaStudio}
                title="Abrir Prisma Studio para visualizar la base de datos"
              >
                Abrir Prisma Studio
              </button>
            </div>
            {dbStats ? (
              <div>
                <div className="grid-stats-small">
                  <div className="stat-card">
                    <div className="stat-label">Total de Registros</div>
                    <div className="stat-value">{dbStats.total}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Dispositivos</div>
                    <div className="stat-value">{dbStats.dispositivos}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Reservas</div>
                    <div className="stat-value">{dbStats.reservas}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Métricas</div>
                    <div className="stat-value">{dbStats.metricas}</div>
                  </div>
                </div>
                <div className="info-box">
                  <h4>Información Técnica</h4>
                  <ul>
                    <li><strong>ORM:</strong> Prisma 5.22.0</li>
                    <li><strong>Base de Datos:</strong> PostgreSQL 12+</li>
                    <li><strong>Conexión:</strong> {API_URL}</li>
                    <li><strong>Tablas:</strong> Dispositivo, Reserva, Metrica</li>
                    <li><strong>Puerto Backend:</strong> 4000</li>
                    <li><strong>Puerto Frontend:</strong> 3000</li>
                    <li><strong>Prisma Studio:</strong> <a href="http://localhost:5555" target="_blank" rel="noopener noreferrer">http://localhost:5555</a></li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-center">{loading ? 'Consultando base de datos...' : 'Presiona "Actualizar Datos" para ver estadísticas'}</p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalles y Edición del Dispositivo */}
      {dispositivoDetalle && (
        <div className="modal-overlay" onClick={() => {
          setDispositivoDetalle(null);
          setModoEdicionModal(false);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modoEdicionModal ? 'Editar Dispositivo' : 'Detalles del Dispositivo'}</h3>
              <button className="modal-close" onClick={() => {
                setDispositivoDetalle(null);
                setModoEdicionModal(false);
              }}>×</button>
            </div>
            <div className="modal-body">
              {!modoEdicionModal ? (
                // Modo solo lectura
                <>
                  <div className="detalle-row">
                    <span className="detalle-label">Nombre:</span>
                    <span className="detalle-value">{dispositivoDetalle.nombre}</span>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">Tipo:</span>
                    <span className={`badge ${dispositivoDetalle.tipo === 'ROBOT' ? 'badge-robot' : 'badge-drone'}`}>
                      {dispositivoDetalle.tipo}
                    </span>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">Identificador:</span>
                    <span className="detalle-value">{dispositivoDetalle.identificador}</span>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">Ubicación:</span>
                    <span className="detalle-value">{dispositivoDetalle.ubicacion}</span>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">Nivel de Batería:</span>
                    <div className="battery-container">
                      <div className="battery-bar">
                        <div 
                          className="battery-fill"
                          style={{
                            width: `${dispositivoDetalle.nivelBateria}%`,
                            backgroundColor: dispositivoDetalle.nivelBateria > 50 ? '#10b981' : dispositivoDetalle.nivelBateria > 20 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                      <span className="battery-text">{dispositivoDetalle.nivelBateria}%</span>
                    </div>
                  </div>
                  <div className="detalle-row">
                    <span className="detalle-label">Estado:</span>
                    <span className={`badge ${getEstadoClass(dispositivoDetalle.estado)}`}>
                      {getEstadoLabel(dispositivoDetalle.estado)}
                    </span>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        setModoEdicionModal(true);
                        setDispositivoForm({
                          nombre: dispositivoDetalle.nombre,
                          tipo: dispositivoDetalle.tipo,
                          identificador: dispositivoDetalle.identificador,
                          ubicacion: dispositivoDetalle.ubicacion,
                          nivelBateria: dispositivoDetalle.nivelBateria,
                          estado: dispositivoDetalle.estado
                        });
                      }}
                    >
                      Editar
                    </button>
                  </div>
                </>
              ) : (
                // Modo edición
                <>
                  <div className="form-grid-2">
                    <div>
                      <label className="form-label">Nombre:</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={dispositivoForm.nombre}
                        onChange={(e) => setDispositivoForm({...dispositivoForm, nombre: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="form-label">Tipo:</label>
                      <select 
                        className="form-input"
                        value={dispositivoForm.tipo}
                        onChange={(e) => setDispositivoForm({...dispositivoForm, tipo: e.target.value as any})}
                      >
                        <option value="ROBOT">ROBOT</option>
                        <option value="DRONE">DRONE</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Identificador:</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={dispositivoForm.identificador}
                        onChange={(e) => setDispositivoForm({...dispositivoForm, identificador: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="form-label">Ubicación:</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={dispositivoForm.ubicacion}
                        onChange={(e) => setDispositivoForm({...dispositivoForm, ubicacion: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="form-label">Nivel de Batería (%):</label>
                      <input 
                        type="number" 
                        className="form-input"
                        min="0" 
                        max="100"
                        value={dispositivoForm.nivelBateria}
                        onChange={(e) => setDispositivoForm({...dispositivoForm, nivelBateria: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="form-label">Estado:</label>
                      <select 
                        className="form-input"
                        value={dispositivoForm.estado}
                        onChange={(e) => setDispositivoForm({...dispositivoForm, estado: e.target.value as any})}
                      >
                        <option value="DISPONIBLE">DISPONIBLE</option>
                        <option value="EN_USO">EN USO</option>
                        <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                        <option value="EN_CARGA">EN CARGA</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn-primary"
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_URL}/api/dispositivos/${dispositivoDetalle.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(dispositivoForm)
                          });
                          
                          if (res.ok) {
                            mostrarNotificacion('Dispositivo actualizado exitosamente', 'success');
                            setDispositivoDetalle(null);
                            setModoEdicionModal(false);
                            actualizarDatos();
                          } else {
                            mostrarNotificacion('Error al actualizar dispositivo', 'error');
                          }
                        } catch (error) {
                          console.error('Error:', error);
                          mostrarNotificacion('Error al conectar con el servidor', 'error');
                        }
                      }}
                    >
                      Guardar Cambios
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => setModoEdicionModal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

