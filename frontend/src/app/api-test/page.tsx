'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Server, Database, Cpu, Activity } from 'lucide-react';
import { api } from '../../lib/api';

interface ApiInfo {
  status?: string;
  message?: string;
  version?: string;
  timestamp?: string;
}

export default function ApiTestPage() {
  const [apiInfo, setApiInfo] = useState<ApiInfo>({});
  const [dispositivos, setDispositivos] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [monitoreo, setMonitoreo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setErrors({});

    const tests = [
      {
        name: 'API Health',
        key: 'health',
        loader: () => api.health().then(data => setApiInfo(data))
      },
      {
        name: 'Dispositivos',
        key: 'dispositivos',
        loader: () => api.dispositivos.getAll().then(data => setDispositivos(data))
      },
      {
        name: 'Reservas',
        key: 'reservas',
        loader: () => api.reservas.getAll().then(data => setReservas(data))
      },
      {
        name: 'Monitoreo',
        key: 'monitoreo',
        loader: () => api.monitoreo.getAll().then(data => setMonitoreo(data))
      }
    ];

    for (const test of tests) {
      try {
        await test.loader();
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          [test.key]: `Error en ${test.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }));
      }
    }

    setLoading(false);
  };

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
                Prueba de Conexión API
              </h1>
              <p className="text-sm text-gray-600">
                Estado de la conexión con el backend
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Refresh Button */}
        <div className="mb-6">
          <button 
            onClick={loadAllData}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Cargando...' : 'Actualizar Datos'}
          </button>
        </div>

        {/* API Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center mb-4">
              <Server className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Estado de la API</h3>
            </div>
            
            {errors.health ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 text-sm">{errors.health}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-medium ${apiInfo.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                    {apiInfo.status || (loading ? 'Cargando...' : 'Sin datos')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Versión:</span>
                  <span className="font-medium text-gray-900">
                    {apiInfo.version || (loading ? 'Cargando...' : 'Sin datos')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última actualización:</span>
                  <span className="font-medium text-gray-900">
                    {apiInfo.timestamp ? new Date(apiInfo.timestamp).toLocaleString() : (loading ? 'Cargando...' : 'Sin datos')}
                  </span>
                </div>
                {apiInfo.message && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-blue-800 text-sm">{apiInfo.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Datos Disponibles</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Cpu className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">Dispositivos</span>
                </div>
                <span className="font-medium text-gray-900">
                  {errors.dispositivos ? '❌' : `${dispositivos.length} registros`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">Reservas</span>
                </div>
                <span className="font-medium text-gray-900">
                  {errors.reservas ? '❌' : `${reservas.length} registros`}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">Monitoreo</span>
                </div>
                <span className="font-medium text-gray-900">
                  {errors.monitoreo ? '❌' : `${monitoreo.length} registros`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Errores de Conexión</h3>
            <div className="space-y-2">
              {Object.entries(errors).map(([key, error]) => (
                <div key={key} className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Data Preview */}
        {dispositivos.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vista Previa de Dispositivos
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">ID</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Nombre</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Tipo</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {dispositivos.slice(0, 5).map((dispositivo, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-3 text-sm text-gray-600">{dispositivo.id}</td>
                      <td className="py-2 px-3 text-sm text-gray-900">{dispositivo.nombre}</td>
                      <td className="py-2 px-3 text-sm text-gray-600">{dispositivo.tipo}</td>
                      <td className="py-2 px-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          dispositivo.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                          dispositivo.estado === 'ocupado' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {dispositivo.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dispositivos.length > 5 && (
                <p className="text-sm text-gray-500 mt-2">
                  ... y {dispositivos.length - 5} dispositivos más
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}