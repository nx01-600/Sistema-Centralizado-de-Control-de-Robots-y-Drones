'use client';

import { useState, useEffect } from 'react';
import { Cpu, Plane, Activity, Calendar, BarChart3, Settings } from 'lucide-react';
import { api } from '../lib/api';

interface Stats {
  totalDispositivos: number;
  disponibles: number;
  reservasActivas: number;
  enMantenimiento: number;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalDispositivos: 0,
    disponibles: 0,
    reservasActivas: 0,
    enMantenimiento: 0,
  });
  const [apiStatus, setApiStatus] = useState<string>('Conectando...');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Verificar estado de la API
      const healthCheck = await api.health();
      setApiStatus(healthCheck.status === 'OK' ? 'Conectado' : 'Error');

      // Cargar dispositivos
      const dispositivosResponse = await api.dispositivos.getAll();
      const dispositivos = Array.isArray(dispositivosResponse) ? dispositivosResponse : [];
      console.log('Dispositivos cargados:', dispositivos);
      
      // Cargar reservas
      const reservasResponse = await api.reservas.getAll();
      const reservas = Array.isArray(reservasResponse) ? reservasResponse : [];
      console.log('Reservas cargadas:', reservas);

      // Calcular estadísticas
      const disponibles = dispositivos.filter((d: any) => d.estado === 'disponible').length;
      const ocupados = dispositivos.filter((d: any) => d.estado === 'ocupado').length;
      const enMantenimiento = dispositivos.filter((d: any) => d.estado === 'mantenimiento').length;
      const reservasActivas = reservas.filter((r: any) => r.estado === 'activa').length;

      console.log('Estadísticas calculadas:', {
        total: dispositivos.length,
        disponibles,
        ocupados,
        enMantenimiento,
        reservasActivas
      });

      setStats({
        totalDispositivos: dispositivos.length,
        disponibles,
        reservasActivas,
        enMantenimiento: enMantenimiento + ocupados, // Incluir ocupados en "En Uso"
      });

    } catch (error) {
      console.error('Error loading data:', error);
      setApiStatus('Error de conexión');
      // Mantener estadísticas en 0 en caso de error
      setStats({
        totalDispositivos: 0,
        disponibles: 0,
        reservasActivas: 0,
        enMantenimiento: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <Plane className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Sistema de Gestión
                  </h1>
                  <p className="text-sm text-gray-600">
                    Robots y Drones Universitarios
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Administrador</p>
                <p className="text-xs text-gray-500">Universidad Javeriana Cali</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido al Sistema Centralizado
          </h2>
          <p className="text-lg text-gray-600">
            Administra y monitorea robots y drones que prestan servicios de transporte interno y grabación audiovisual.
          </p>
        </div>

        {/* API Status */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${apiStatus === 'Conectado' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">Estado de la API: {apiStatus}</span>
              </div>
              <button 
                onClick={loadData}
                className="btn-primary text-sm"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Cpu className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dispositivos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '--' : stats.totalDispositivos}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg">
                <Activity className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '--' : stats.disponibles}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-lg">
                <Calendar className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reservas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '--' : stats.reservasActivas}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Uso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '--' : stats.enMantenimiento}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavCard
            title="Gestión de Dispositivos"
            description="Administra robots y drones, revisa su estado y configuración"
            icon={<Cpu className="h-8 w-8" />}
            href="/dispositivos"
            color="primary"
          />

          <NavCard
            title="Sistema de Reservas"
            description="Crea, gestiona y consulta reservas para servicios"
            icon={<Calendar className="h-8 w-8" />}
            href="/reservas"
            color="success"
          />

          <NavCard
            title="Monitoreo en Tiempo Real"
            description="Visualiza ubicación, batería y sensores de dispositivos"
            icon={<Activity className="h-8 w-8" />}
            href="/monitoreo"
            color="warning"
          />

          <NavCard
            title="Bitácoras de Uso"
            description="Revisa registros de salida, regreso y servicios prestados"
            icon={<BarChart3 className="h-8 w-8" />}
            href="/bitacoras"
            color="danger"
          />

          <NavCard
            title="Videos Almacenados"
            description="Gestiona videos de recorridos y grabaciones"
            icon={<Settings className="h-8 w-8" />}
            href="/videos"
            color="secondary"
          />

          <NavCard
            title="Estadísticas y Reportes"
            description="Consulta métricas y genera reportes del sistema"
            icon={<BarChart3 className="h-8 w-8" />}
            href="/estadisticas"
            color="primary"
          />

          <NavCard
            title="Prueba de API"
            description="Verifica la conexión con el backend y base de datos"
            icon={<Settings className="h-8 w-8" />}
            href="/api-test"
            color="secondary"
          />

          <NavCard
            title="Base de Datos"
            description="Explora y administra los datos del sistema"
            icon={<BarChart3 className="h-8 w-8" />}
            href="/database"
            color="primary"
          />
        </div>

        {/* Info Section */}
        <div className="mt-12 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Desarrollado por:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Nicolás Carreño Tascón</li>
                <li>• Daniel Felipe Barrera Zapata</li>
                <li>• Maria Camila Guzman Bolaños</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Universidad:</h4>
              <p className="text-sm text-gray-600">
                Pontificia Universidad Javeriana de Cali<br />
                Ingeniería de Sistemas y Computación
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Versión:</h4>
              <p className="text-sm text-gray-600">
                Sistema v1.0.0<br />
                Prototipo Académico
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface NavCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

function NavCard({ title, description, icon, href, color }: NavCardProps) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-100 hover:bg-primary-50',
    secondary: 'text-secondary-600 bg-secondary-100 hover:bg-secondary-50',
    success: 'text-success-600 bg-success-100 hover:bg-success-50',
    warning: 'text-warning-600 bg-warning-100 hover:bg-warning-50',
    danger: 'text-danger-600 bg-danger-100 hover:bg-danger-50',
  };

  return (
    <a
      href={href}
      className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
    >
      <div className={`p-3 rounded-lg w-fit mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">
        {description}
      </p>
    </a>
  );
}