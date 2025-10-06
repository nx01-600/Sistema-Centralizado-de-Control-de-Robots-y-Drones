'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Database, Eye, Trash2, Plus, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState('dispositivos');
  const [data, setData] = useState<{[key: string]: any[]}>({
    dispositivos: [],
    reservas: [],
    bitacoras: [],
    monitoreo: [],
    videos: []
  });
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const tabs = [
    { id: 'dispositivos', name: 'Dispositivos', count: data.dispositivos?.length || 0 },
    { id: 'reservas', name: 'Reservas', count: data.reservas?.length || 0 },
    { id: 'bitacoras', name: 'Bitácoras', count: data.bitacoras?.length || 0 },
    { id: 'monitoreo', name: 'Monitoreo', count: data.monitoreo?.length || 0 },
    { id: 'videos', name: 'Videos', count: data.videos?.length || 0 }
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const promises = tabs.map(tab => loadTabData(tab.id));
    await Promise.all(promises);
  };

  const loadTabData = async (tabId: string) => {
    setLoading(prev => ({ ...prev, [tabId]: true }));
    setErrors(prev => ({ ...prev, [tabId]: '' }));

    try {
      let result;
      switch (tabId) {
        case 'dispositivos':
          result = await api.dispositivos.getAll();
          break;
        case 'reservas':
          result = await api.reservas.getAll();
          break;
        case 'bitacoras':
          result = await api.bitacoras.getAll();
          break;
        case 'monitoreo':
          result = await api.monitoreo.getAll();
          break;
        case 'videos':
          result = await api.videos.getAll();
          break;
        default:
          result = [];
      }

      setData(prev => ({
        ...prev,
        [tabId]: Array.isArray(result) ? result : []
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setErrors(prev => ({ ...prev, [tabId]: errorMessage }));
      setData(prev => ({ ...prev, [tabId]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [tabId]: false }));
    }
  };

  const renderTable = (items: any[], type: string) => {
    if (!Array.isArray(items) || items.length === 0) {
      return (
        <div className="text-center py-8">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      );
    }

    const firstItem = items[0];
    const columns = Object.keys(firstItem);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderCellValue(item[column], column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCellValue = (value: any, column: string) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Sí' : 'No'}
        </span>
      );
    }

    if (column === 'estado' && typeof value === 'string') {
      const colorMap: {[key: string]: string} = {
        'disponible': 'bg-green-100 text-green-800',
        'ocupado': 'bg-yellow-100 text-yellow-800',
        'mantenimiento': 'bg-red-100 text-red-800',
        'activa': 'bg-blue-100 text-blue-800',
        'completada': 'bg-gray-100 text-gray-800',
        'cancelada': 'bg-red-100 text-red-800'
      };
      
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${colorMap[value] || 'bg-gray-100 text-gray-800'}`}>
          {value}
        </span>
      );
    }

    if (column.includes('fecha') || column.includes('timestamp') || column.includes('Date')) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <a 
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-6"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al inicio
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Administrador de Base de Datos
                </h1>
                <p className="text-sm text-gray-600">
                  Explora y gestiona los datos del sistema
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={loadAllData}
                className="btn-primary flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Todo
              </button>
              <a 
                href="http://localhost:5555" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Prisma Studio
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Info Box */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <p className="text-blue-800 font-medium">Herramientas de Base de Datos</p>
              <p className="text-blue-700 text-sm">
                • <strong>Prisma Studio</strong>: Interfaz visual completa en http://localhost:5555
                <br />
                • <strong>Esta página</strong>: Vista rápida de datos desde la API
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {tabs.find(t => t.id === activeTab)?.name}
              </h3>
              <button 
                onClick={() => loadTabData(activeTab)}
                disabled={loading[activeTab]}
                className="btn-secondary flex items-center text-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading[activeTab] ? 'animate-spin' : ''}`} />
                {loading[activeTab] ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {errors[activeTab] && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-800 text-sm">
                  Error: {errors[activeTab]}
                </p>
              </div>
            )}

            {loading[activeTab] ? (
              <div className="flex items-center justify-center py-8">
                <div className="spinner w-8 h-8 mr-3"></div>
                <span className="text-gray-600">Cargando datos...</span>
              </div>
            ) : (
              renderTable(data[activeTab], activeTab)
            )}
          </div>
        </div>
      </main>
    </div>
  );
}