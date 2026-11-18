export type CargoRole = 'GERENTE' | 'ADMINISTRADOR' | 'RESIDENTE' | 'OBRERO';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAuthorized: boolean;
  activeRole: CargoRole | null;
  authProvider: 'google' | 'corporate';
  phone?: string;
  cipDni?: string;
  specialty?: string;
}

export interface CargoItemRecord {
  id: string;
  title: string;
  status: 'ACTIVO' | 'EN_CURSO' | 'COMPLETADO' | 'PENDIENTE';
  subtitle?: string;
  code?: string;
  driveFileId?: string;
  driveLink?: string;
  updatedAt?: string;
  details?: Record<string, any>;
  attachedPdfName?: string;
  attachedPdfData?: string;
  attachedPdfDate?: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
    label?: string;
  };
  notes?: string;
}

export interface GpsLocationRecord {
  id: string;
  userId: string;
  userEmail: string;
  cargo: CargoRole;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  notes?: string;
  altitude?: number;
  speed?: number;
}

export interface RealtimePersonnelLocation {
  userEmail: string;
  userName: string;
  cargo: CargoRole;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
  notes?: string;
  lastSeen?: number;
}

export interface SheetRowData {
  id: string;
  [key: string]: string;
}

export interface SheetConfig {
  cargo: CargoRole;
  title: string;
  driveLink: string;
  columns: { key: string; label: string; placeholder?: string; width?: string }[];
  initialRows: SheetRowData[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  email: string;
  action: string;
  role?: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
  ip?: string;
}
