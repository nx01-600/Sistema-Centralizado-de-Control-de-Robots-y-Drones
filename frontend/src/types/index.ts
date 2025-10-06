// Tipos para dispositivos
export type TipoDispositivo = 'ROBOT' | 'DRONE';

export type EstadoDispositivo = 
  | 'DISPONIBLE' 
  | 'EN_USO' 
  | 'MANTENIMIENTO' 
  | 'FUERA_DE_SERVICIO';

export interface Dispositivo {
  id: string;
  nombre: string;
  tipo: TipoDispositivo;
  modelo: string;
  numeroSerie: string;
  estado: EstadoDispositivo;
  ubicacionActual?: string;
  nivelBateria?: number;
  pesoMaximoCarga?: number;
  autonomiaMaxima?: number;
  velocidadMaxima?: number;
  alturaMaxima?: number;
  fechaAdquisicion: string;
  fechaUltimoManten?: string;
  horasVuelo: number;
  kilometrosRecorr: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reservas: number;
    bitacoras: number;
    videosAlmacenados: number;
  };
}

// Tipos para reservas
export type EstadoReserva = 'PENDIENTE' | 'ACTIVA' | 'COMPLETADA' | 'CANCELADA';

export type TipoServicio = 
  | 'TRANSPORTE_INTERNO' 
  | 'GRABACION_AUDIOVISUAL' 
  | 'MONITOREO' 
  | 'MANTENIMIENTO';

export interface Reserva {
  id: string;
  dispositivoId: string;
  dispositivo?: Dispositivo;
  fechaInicio: string;
  fechaFin: string;
  tipoServicio: TipoServicio;
  descripcion?: string;
  ubicacionOrigen: string;
  ubicacionDestino?: string;
  solicitadoPor: string;
  contacto: string;
  estado: EstadoReserva;
  observaciones?: string;
  bitacora?: Bitacora;
  createdAt: string;
  updatedAt: string;
}

// Tipos para bitácoras
export interface Bitacora {
  id: string;
  reservaId: string;
  reserva?: Reserva;
  dispositivoId: string;
  dispositivo?: Dispositivo;
  horaSalida?: string;
  horaRegreso?: string;
  duracionTotal?: number;
  servicioPrestado: TipoServicio;
  rutaRecorrida?: string;
  distanciaRecorr?: number;
  batteryInicio?: number;
  batteryFin?: number;
  incidencias?: string;
  observaciones?: string;
  energiaConsumida?: number;
  createdAt: string;
  updatedAt: string;
}

// Tipos para monitoreo
export interface EstadoMonitoreo {
  id: string;
  dispositivoId: string;
  dispositivo?: Dispositivo;
  latitud: number;
  longitud: number;
  altitud?: number;
  nivelBateria: number;
  velocidadActual: number;
  temperatura?: number;
  sensorOK: boolean;
  camaraOK: boolean;
  gpsOK: boolean;
  señalWiFi?: number;
  señal4G?: number;
  enMovimiento: boolean;
  modoAutonomo: boolean;
  timestamp: string;
}

// Tipos para videos
export interface VideoAlmacenado {
  id: string;
  dispositivoId: string;
  dispositivo?: Dispositivo;
  nombreArchivo: string;
  duracion: number;
  tamaño: number;
  resolucion: string;
  formato: string;
  fechaGrabacion: string;
  ubicacionGrab: string;
  tipoGrabacion: string;
  urlAlmacenamiento?: string;
  cloudProvider?: string;
  bucketName?: string;
  descripcion?: string;
  etiquetas: string[];
  publico: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos para formularios
export interface CreateDispositivoForm {
  nombre: string;
  tipo: TipoDispositivo;
  modelo: string;
  numeroSerie: string;
  pesoMaximoCarga?: number;
  autonomiaMaxima?: number;
  velocidadMaxima?: number;
  alturaMaxima?: number;
}

export interface CreateReservaForm {
  dispositivoId: string;
  fechaInicio: string;
  fechaFin: string;
  tipoServicio: TipoServicio;
  descripcion?: string;
  ubicacionOrigen: string;
  ubicacionDestino?: string;
  solicitadoPor: string;
  contacto: string;
}

// Tipos para API responses
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Tipos para estadísticas
export interface DispositivosStats {
  total: number;
  porTipo: {
    robots: number;
    drones: number;
  };
  porEstado: {
    disponibles: number;
    enUso: number;
    mantenimiento: number;
    fueraDeServicio: number;
  };
}

export interface ReservasStats {
  total: number;
  porEstado: {
    pendientes: number;
    activas: number;
    completadas: number;
    canceladas: number;
  };
  porTipoServicio: {
    transporteInterno: number;
    grabacionAudiovisual: number;
    monitoreo: number;
    mantenimiento: number;
  };
}

export interface BitacorasStats {
  total: number;
  porServicio: {
    transporteInterno: number;
    grabacionAudiovisual: number;
    monitoreo: number;
    mantenimiento: number;
  };
  promedios: {
    duracionPromedio: number;
    distanciaTotalRecorrida: number;
  };
}

export interface VideosStats {
  total: number;
  duracionTotal: number;
  tamañoTotal: number;
  duracionPromedio: number;
  tamañoPromedio: number;
  porTipoGrabacion: Array<{
    tipoGrabacion: string;
    _count: { tipoGrabacion: number };
  }>;
  porFormato: Array<{
    formato: string;
    _count: { formato: number };
  }>;
}