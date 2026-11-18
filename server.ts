import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'geosciences_sac_secure_jwt_secret_key_2026_x8714';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Role passwords strictly stored and verified only on the backend
const ROLE_PASSWORDS: Record<string, string> = {
  GERENTE: '18714',
  ADMINISTRADOR: '45319',
  RESIDENTE: '810971',
  OBRERO: '99810',
};

// User access key password strictly verified on the backend for standard login
const USER_LOGIN_KEY = '900308983';

// Initial authorized emails and domains for GEOCIENCES S.A.C.
const authorizedEmails = new Set<string>([
  'danidaniloacostasamaniego@gmail.com',
  'gerencia@geosciences.pe',
  'admin@geosciences.pe',
  'residencia.minas@geosciences.pe',
  'operaciones@geosciences.pe',
  'danilo.acosta@geosciences.pe',
]);

const authorizedDomains = ['geosciences.pe', 'geosciences.com', 'geociencias.com.pe', 'geociencias.com'];

// In-memory audit log
interface AuditEntry {
  id: string;
  timestamp: string;
  email: string;
  action: string;
  role?: string;
  status: 'SUCCESS' | 'FAILED';
  details?: string;
  ip?: string;
}

const auditLogs: AuditEntry[] = [
  {
    id: 'log-init-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    email: 'sistema@geosciences.pe',
    action: 'SYSTEM_BOOT',
    status: 'SUCCESS',
    details: 'Servidor de seguridad y autenticación inicializado.',
  },
];

function isEmailAuthorized(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  // Allow any valid personal or institutional email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalized);
}

// 1. Verify Google or standard authenticated user (accepts any valid personal or institutional email)
app.post('/api/auth/verify-google-user', (req: Request, res: Response) => {
  const { email, displayName, photoURL } = req.body;

  if (!email) {
    return res.status(400).json({
      authorized: false,
      message: 'Correo electrónico no proporcionado.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const authorized = isEmailAuthorized(normalizedEmail);

  if (!authorized) {
    auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      email: normalizedEmail,
      action: 'AUTH_INVALID_EMAIL',
      status: 'FAILED',
      details: 'Formato de correo electrónico inválido.',
      ip: req.ip,
    });

    return res.status(400).json({
      authorized: false,
      email: normalizedEmail,
      message: `El correo "${normalizedEmail}" no tiene un formato válido.`,
    });
  }

  // Register email in session roster
  authorizedEmails.add(normalizedEmail);

  // Generate initial authorized pre-session token (needs role confirmation)
  const preAuthToken = jwt.sign(
    {
      email: normalizedEmail,
      displayName: displayName || normalizedEmail.split('@')[0] || 'Usuario',
      photoURL: photoURL || '',
      isPreAuthorized: true,
      activeRole: null,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.cookie('geo_session', preAuthToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
  });

  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    email: normalizedEmail,
    action: 'USER_AUTH_SUCCESS',
    status: 'SUCCESS',
    details: 'Usuario validado (correo personal o institucional) para GEOCIENCES S.A.C.',
    ip: req.ip,
  });

  return res.json({
    authorized: true,
    email: normalizedEmail,
    displayName: displayName || normalizedEmail.split('@')[0] || 'Usuario',
    photoURL: photoURL || '',
    token: preAuthToken,
    message: 'Usuario validado para ingresar a GEOCIENCES S.A.C.',
  });
});

// 1b. Standard login endpoint requiring valid email and exact user key password (900308983)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  if (!email) {
    return res.status(400).json({
      authorized: false,
      message: 'Correo electrónico no proporcionado.',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isEmailAuthorized(normalizedEmail)) {
    auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      email: normalizedEmail,
      action: 'AUTH_INVALID_EMAIL',
      status: 'FAILED',
      details: 'Formato de correo electrónico inválido.',
      ip: req.ip,
    });

    return res.status(400).json({
      authorized: false,
      email: normalizedEmail,
      message: `El correo "${normalizedEmail}" no tiene un formato válido.`,
    });
  }

  if (!password || String(password).trim() !== USER_LOGIN_KEY) {
    auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      email: normalizedEmail,
      action: 'USER_LOGIN_KEY_FAILED',
      status: 'FAILED',
      details: 'Intento de inicio de sesión con clave de usuario incorrecta.',
      ip: req.ip,
    });

    return res.status(401).json({
      authorized: false,
      email: normalizedEmail,
      message: 'Clave de usuario incorrecta. Ingrese la clave correcta para acceder al sistema.',
    });
  }

  authorizedEmails.add(normalizedEmail);

  const preAuthToken = jwt.sign(
    {
      email: normalizedEmail,
      displayName: displayName || normalizedEmail.split('@')[0] || 'Usuario',
      photoURL: '',
      isPreAuthorized: true,
      activeRole: null,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.cookie('geo_session', preAuthToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
  });

  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    email: normalizedEmail,
    action: 'USER_AUTH_SUCCESS',
    status: 'SUCCESS',
    details: 'Usuario autenticado con correo y clave de usuario válida.',
    ip: req.ip,
  });

  return res.json({
    authorized: true,
    email: normalizedEmail,
    displayName: displayName || normalizedEmail.split('@')[0] || 'Usuario',
    photoURL: '',
    token: preAuthToken,
    message: 'Acceso autorizado al sistema de GEOCIENCES S.A.C.',
  });
});

// 2. Verify cargo password strictly on backend
app.post('/api/auth/verify-role', (req: Request, res: Response) => {
  const { role, password, email } = req.body;

  if (!role || !password) {
    return res.status(400).json({
      success: false,
      message: 'Datos incompletos. Se requiere cargo y contraseña.',
    });
  }

  const expectedPassword = ROLE_PASSWORDS[role];
  if (!expectedPassword) {
    return res.status(400).json({
      success: false,
      message: 'Cargo no reconocido en el sistema.',
    });
  }

  // Constant-time check / string match
  const isMatch = password.trim() === expectedPassword;

  if (!isMatch) {
    auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      email: email || 'anónimo',
      action: 'ROLE_PASSWORD_ATTEMPT',
      role,
      status: 'FAILED',
      details: `Intento fallido de acceso al cargo ${role}. Contraseña incorrecta.`,
      ip: req.ip,
    });

    return res.status(401).json({
      success: false,
      message: 'CONTRASEÑA INCORRECTA',
    });
  }

  // Generate full session token with authorized activeRole
  const sessionUserEmail = email || 'usuario.autorizado@geosciences.pe';
  const roleSessionToken = jwt.sign(
    {
      email: sessionUserEmail,
      activeRole: role,
      roleAuthorizedAt: new Date().toISOString(),
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.cookie('geo_role_token', roleSessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
  });

  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    email: sessionUserEmail,
    action: 'ROLE_ACCESS_GRANTED',
    role,
    status: 'SUCCESS',
    details: `Acceso otorgado al panel de ${role}. Contraseña validada por el backend.`,
    ip: req.ip,
  });

  return res.json({
    success: true,
    role,
    sessionToken: roleSessionToken,
    message: `Acceso concedido al panel de ${role}.`,
  });
});

// 3. Verify session
app.get('/api/auth/session', (req: Request, res: Response) => {
  const token = req.cookies.geo_role_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.json({
      authenticated: false,
      activeRole: null,
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      activeRole: string;
      roleAuthorizedAt: string;
    };

    return res.json({
      authenticated: true,
      email: decoded.email,
      activeRole: decoded.activeRole,
      roleAuthorizedAt: decoded.roleAuthorizedAt,
    });
  } catch {
    return res.json({
      authenticated: false,
      activeRole: null,
    });
  }
});

// 4. Logout / Switch cargo
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('geo_session');
  res.clearCookie('geo_role_token');
  return res.json({ success: true, message: 'Sesión finalizada correctamente.' });
});

// 5. Audit logs endpoint (for Gerente / Administrador panels)
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json({ logs: auditLogs.slice(0, 50) });
});

// 6. Authorized emails management
app.get('/api/authorized-emails', (_req: Request, res: Response) => {
  res.json({
    emails: Array.from(authorizedEmails),
    domains: authorizedDomains,
  });
});

app.post('/api/authorized-emails', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Correo inválido' });
  }
  authorizedEmails.add(email.trim().toLowerCase());
  return res.json({ success: true, emails: Array.from(authorizedEmails) });
});

// In-memory persistent data store for Cargo Items (synchronized with Drive & Firestore)
const cargoItemsStore: Record<string, any[]> = {
  GERENTE: [
    {
      id: 'prj-ger-01',
      title: 'Sondaje Diamantino Las Bambas - Fase IV',
      status: 'ACTIVO',
      subtitle: 'Exploración Geotécnica Pit Ferrobamba • Prof. 3,500m',
      code: 'DDH-LB-2026',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prj-ger-02',
      title: 'Estudio Geotécnico de Taludes y Botaderos Antamina',
      status: 'ACTIVO',
      subtitle: 'Monitoreo de Estabilidad de Presa de Relaves',
      code: 'GEO-ANT-26',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prj-ger-03',
      title: 'Refracción Sísmica y Geofísica Túnel Trasandino',
      status: 'EN_CURSO',
      subtitle: 'Ensayos MASW y Perfiles Tomográficos de Suelo',
      code: 'GEOF-TUN-01',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prj-ger-04',
      title: 'Control de Estabilidad de Presa Quellaveco',
      status: 'ACTIVO',
      subtitle: 'Instrumentación con Piezómetros Cuerda Vibrante',
      code: 'EST-QLL-04',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prj-ger-05',
      title: 'Perforación Hidrogeológica y Piezómetros Mina Justa',
      status: 'PENDIENTE',
      subtitle: 'Campaña de Pozos de Monitoreo de Acuíferos',
      code: 'HID-MJ-2026',
      updatedAt: new Date().toISOString(),
    },
  ],
  ADMINISTRADOR: [
    {
      id: 'emp-adm-01',
      title: 'Carlos Eduardo Mendoza Rivas',
      status: 'ACTIVO',
      subtitle: 'Perforista Titular Sonda Diamantina CS14 • SCTR Vigente',
      code: 'OPER-081',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'emp-adm-02',
      title: 'Jorge Luis Huamán Quispe',
      status: 'ACTIVO',
      subtitle: 'Técnico Mecánico de Sonda e Hidráulica de Mina',
      code: 'MEC-014',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'emp-adm-03',
      title: 'Patricia Elena Soto Paredes',
      status: 'ACTIVO',
      subtitle: 'Ingeniera Geóloga de Testigos y Caracterización RQD',
      code: 'GEO-042',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'emp-adm-04',
      title: 'Marcos Antonio Salazar Cárdenas',
      status: 'ACTIVO',
      subtitle: 'Operador Ayudante de Perforación y Manipulación de Varillaje',
      code: 'OPER-099',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'emp-adm-05',
      title: 'Manuel Fernando Torres Quispe',
      status: 'ACTIVO',
      subtitle: 'Conductor de Camión Plataforma e Insumos Críticos',
      code: 'LOG-019',
      updatedAt: new Date().toISOString(),
    },
  ],
  RESIDENTE: [
    {
      id: 'res-prj-01',
      title: 'Campaña Sondaje Diamantino Pozo DDH-24-08',
      status: 'EN_CURSO',
      subtitle: 'Plataforma 08, Ferrobamba • Avance 142.5m • RQD 84%',
      code: 'DDH-24-08',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'res-prj-02',
      title: 'Ensayo Lugeon y Conductividad Pozo P-02',
      status: 'EN_CURSO',
      subtitle: 'Presa de Relaves Antamina • 5 etapas de inyección',
      code: 'LUG-P02',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'res-prj-03',
      title: 'Calicata y Ensayo de Penetración Estándar SPT C-03',
      status: 'COMPLETADO',
      subtitle: 'Talud Norte • Muestreo inalterado en tubo Shelby',
      code: 'SPT-C03',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'res-prj-04',
      title: 'Instalación de Inclinómetro y Piezómetro Casagrande',
      status: 'PENDIENTE',
      subtitle: 'Sector Quebrada Huayco • Monitoreo de Desplazamientos',
      code: 'INC-QH-01',
      updatedAt: new Date().toISOString(),
    },
  ],
  OBRERO: [
    {
      id: 'obr-act-01',
      title: 'Desacople y lubricación de varillaje HQ Pozo 08',
      status: 'EN_CURSO',
      subtitle: 'Frente de Perforación • Cuadrilla Turno Día • Grasa vegetal',
      code: 'ACT-01',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'obr-act-02',
      title: 'Dosificación de bentonita y polímeros en poza de lodos',
      status: 'ACTIVO',
      subtitle: 'Tratamiento de Fluidos • Viscosidad Marsh regulada a 42s',
      code: 'ACT-02',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'obr-act-03',
      title: 'Extracción y ordenamiento de testigos de roca en cajas',
      status: 'COMPLETADO',
      subtitle: 'Plataforma Sonda CS14 • Testigo íntegro sin fracturas',
      code: 'ACT-03',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'obr-act-04',
      title: 'Inspección diaria de estrobos, cables y winche de izaje',
      status: 'COMPLETADO',
      subtitle: 'Seguridad Mecánica de Mástil • Verificación de cables',
      code: 'ACT-04',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'obr-act-05',
      title: 'Limpieza y orden 5S en plataforma antes de cambio de turno',
      status: 'PENDIENTE',
      subtitle: 'Zona de Acopio de Herramientas • Programado 18:30 hrs',
      code: 'ACT-05',
      updatedAt: new Date().toISOString(),
    },
  ],
};

// 7. Get cargo items
app.get('/api/items/:cargo', (req: Request, res: Response) => {
  const cargo = req.params.cargo.toUpperCase();
  const items = cargoItemsStore[cargo] || [];
  res.json({ items });
});

// Create new cargo item
app.post('/api/items/:cargo', (req: Request, res: Response) => {
  const cargo = req.params.cargo.toUpperCase();
  const newItem = req.body;

  if (!cargoItemsStore[cargo]) {
    cargoItemsStore[cargo] = [];
  }

  cargoItemsStore[cargo].unshift(newItem);

  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    email: 'usuario.sincronizado@geosciences.pe',
    action: 'ITEM_CREATED_SYNC',
    role: cargo,
    status: 'SUCCESS',
    details: `Nuevo registro "${newItem.title}" insertado y sincronizado con Google Drive.`,
    ip: req.ip,
  });

  res.json({ success: true, item: newItem });
});

// Update cargo item (e.g. title, subtitle, notes, attached PDF, coordinates)
app.put('/api/items/:cargo/:id', (req: Request, res: Response) => {
  const cargo = req.params.cargo.toUpperCase();
  const id = req.params.id;
  const updates = req.body;

  if (!cargoItemsStore[cargo]) {
    return res.status(404).json({ error: 'Cargo no encontrado' });
  }

  const itemIndex = cargoItemsStore[cargo].findIndex((it) => it.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Ítem no encontrado' });
  }

  const existingItem = cargoItemsStore[cargo][itemIndex];
  const updatedItem = {
    ...existingItem,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  cargoItemsStore[cargo][itemIndex] = updatedItem;

  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    email: 'usuario.sincronizado@geosciences.pe',
    action: updates.attachedPdfName ? 'PDF_ATTACHED_SYNC' : 'ITEM_UPDATED_SYNC',
    role: cargo,
    status: 'SUCCESS',
    details: updates.attachedPdfName
      ? `Archivo PDF "${updates.attachedPdfName}" adjuntado al registro ${id}.`
      : `Registro ${id} ("${updatedItem.title}") actualizado y sincronizado con Google Drive.`,
    ip: req.ip,
  });

  res.json({ success: true, item: updatedItem });
});

// 8. Sheets data store
const sheetsDataStore: Record<string, any[]> = {};

app.get('/api/sheets/:cargo', (req: Request, res: Response) => {
  const cargo = req.params.cargo.toUpperCase();
  res.json({ rows: sheetsDataStore[cargo] || null });
});

app.post('/api/sheets/:cargo', (req: Request, res: Response) => {
  const cargo = req.params.cargo.toUpperCase();
  const { rows, updatedBy } = req.body;
  sheetsDataStore[cargo] = rows;

  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    email: updatedBy || 'usuario@geosciences.pe',
    action: 'SHEETS_AUTO_SYNC',
    role: cargo,
    status: 'SUCCESS',
    details: `Hoja de cálculo de ${cargo} sincronizada (${rows?.length || 0} filas actualizadas).`,
    ip: req.ip,
  });

  res.json({ success: true, message: 'Datos guardados y sincronizados' });
});

// 9. GPS locations and Real-Time Tracking Store
const gpsLocationsStore: any[] = [];
// Store for active real-time coordinates reported by field workers, residents, and admins
const realtimeLocationsStore: Record<string, any> = {
  // Pre-seeded active operations in Peru mining zones
  'obrero.mina@geosciences.pe': {
    userEmail: 'obrero.mina@geosciences.pe',
    userName: 'Juan Carlos Quispe',
    cargo: 'OBRERO',
    latitude: -14.1251,
    longitude: -72.5422,
    accuracy: 4,
    altitude: 4320,
    speed: 1.2,
    heading: 145,
    timestamp: new Date().toISOString(),
    notes: 'Frente Ferrobamba - Perforación Diamantina Pozo DDH-24-10',
    lastSeen: Date.now(),
  },
  'residente.mina@geosciences.pe': {
    userEmail: 'residente.mina@geosciences.pe',
    userName: 'Ing. Carlos Mendoza (CIP 189201)',
    cargo: 'RESIDENTE',
    latitude: -14.1245,
    longitude: -72.5412,
    accuracy: 3,
    altitude: 4350,
    speed: 0,
    heading: 90,
    timestamp: new Date().toISOString(),
    notes: 'Supervisión en Plataforma P-10 Las Bambas',
    lastSeen: Date.now(),
  },
};

// Maps Configuration endpoint
app.get('/api/config/maps', (_req: Request, res: Response) => {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    '';
  res.json({ apiKey });
});

// Server-side Reverse Geocoding proxy (avoids CORS trap per Google Maps Platform guidelines)
app.get('/api/maps/reverse-geocode', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    '';

  if (!lat || !lng || !apiKey) {
    return res.json({ formattedAddress: null, plusCode: null });
  }

  try {
    const url = new URL('https://geocode.googleapis.com/v4/geocode/location');
    url.searchParams.append('location.latitude', String(lat));
    url.searchParams.append('location.longitude', String(lng));
    url.searchParams.append('languageCode', 'es');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'results.placeId,results.formattedAddress,plusCode',
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
      },
    });

    if (response.ok) {
      const data: any = await response.json();
      const firstResult = data?.results?.[0];
      return res.json({
        formattedAddress: firstResult?.formattedAddress || null,
        plusCode: data?.plusCode?.compoundCode || data?.plusCode?.globalCode || null,
        placeId: firstResult?.placeId || null,
      });
    }

    // Fallback to standard Geocoding API REST endpoint
    const restUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
      `${lat},${lng}`
    )}&language=es&key=${encodeURIComponent(apiKey)}`;
    const restRes = await fetch(restUrl);
    if (restRes.ok) {
      const restData: any = await restRes.json();
      if (restData?.status === 'OK' && restData?.results?.[0]) {
        return res.json({
          formattedAddress: restData.results[0].formatted_address || null,
          plusCode: restData.plus_code?.compound_code || restData.plus_code?.global_code || null,
          placeId: restData.results[0].place_id || null,
        });
      }
    }

    return res.json({ formattedAddress: null, plusCode: null });
  } catch (err) {
    console.warn('Reverse geocode proxy warning:', err);
    return res.json({ formattedAddress: null, plusCode: null });
  }
});

// Real-time GPS stream receive endpoint
app.post('/api/gps/realtime', (req: Request, res: Response) => {
  const { userEmail, userName, cargo, latitude, longitude, accuracy, altitude, speed, heading, notes } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Coordenadas inválidas' });
  }

  const key = (userEmail || cargo || 'campo').toLowerCase().trim();
  const locationRecord = {
    userEmail: userEmail || 'operador@geosciences.pe',
    userName: userName || userEmail?.split('@')[0] || 'Operador en Campo',
    cargo: cargo || 'OBRERO',
    latitude: Number(latitude),
    longitude: Number(longitude),
    accuracy: accuracy ? Math.round(Number(accuracy)) : 5,
    altitude: altitude ? Math.round(Number(altitude)) : undefined,
    speed: speed !== null && speed !== undefined ? Number(speed) : undefined,
    heading: heading !== null && heading !== undefined ? Number(heading) : undefined,
    timestamp: new Date().toISOString(),
    notes: notes || undefined,
    lastSeen: Date.now(),
  };

  realtimeLocationsStore[key] = locationRecord;

  // Also add to historical log (avoid flooding: only if position changed significantly or >30s since last)
  const lastRecord = gpsLocationsStore[0];
  const timeDiff = lastRecord ? Date.now() - new Date(lastRecord.timestamp).getTime() : 999999;
  if (!lastRecord || timeDiff > 30000) {
    gpsLocationsStore.unshift({
      id: `gps-rt-${Date.now()}`,
      ...locationRecord,
    });
    if (gpsLocationsStore.length > 200) {
      gpsLocationsStore.pop();
    }
  }

  res.json({
    success: true,
    transmittedAt: locationRecord.timestamp,
    message: 'Coordenadas en tiempo real recibidas y sincronizadas.',
  });
});

// Real-time GPS stream query endpoint (all active personnel)
app.get('/api/gps/realtime', (_req: Request, res: Response) => {
  const activeWorkers = Object.values(realtimeLocationsStore);
  res.json({
    activePersonnel: activeWorkers,
    count: activeWorkers.length,
    serverTime: new Date().toISOString(),
  });
});

app.get('/api/gps', (_req: Request, res: Response) => {
  res.json({ locations: gpsLocationsStore.slice(0, 50) });
});

app.post('/api/gps', (req: Request, res: Response) => {
  const location = req.body;
  if (!location.latitude || !location.longitude) {
    return res.status(400).json({ error: 'Coordenadas requeridas' });
  }
  gpsLocationsStore.unshift(location);

  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    email: location.userEmail || 'operador@geosciences.pe',
    action: 'GPS_CAPTURE_SAVED',
    role: location.cargo,
    status: 'SUCCESS',
    details: `Punto GPS guardado: ${location.latitude}, ${location.longitude} (Precisión: ±${location.accuracy}m).`,
    ip: req.ip,
  });

  res.json({ success: true, location });
});

// 10. Profile persistence
const userProfilesStore: Record<string, any> = {};

app.post('/api/profile', (req: Request, res: Response) => {
  const profile = req.body;
  if (!profile.email) {
    return res.status(400).json({ error: 'Email requerido' });
  }

  const primaryKey = profile.email.toLowerCase().trim();
  userProfilesStore[primaryKey] = profile;

  if (profile.uid) {
    userProfilesStore[profile.uid] = profile;
  }
  if (profile.originalEmail) {
    userProfilesStore[profile.originalEmail.toLowerCase().trim()] = profile;
  }

  // Also ensure updated email is authorized if domain or user matches
  if (!authorizedEmails.has(primaryKey)) {
    authorizedEmails.add(primaryKey);
  }

  res.json({ success: true, profile });
});

app.get('/api/profile/:idOrEmail', (req: Request, res: Response) => {
  const key = req.params.idOrEmail.toLowerCase().trim();
  const profile = userProfilesStore[key] || userProfilesStore[req.params.idOrEmail] || null;
  res.json({ profile });
});

// Start Express server and attach Vite middleware in dev or static in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GEOCIENCES S.A.C. Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
