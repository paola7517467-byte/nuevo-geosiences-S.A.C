import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../types';
import {
  Users2,
  Mail,
  Truck,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Boxes,
  Shield,
  Loader2,
} from 'lucide-react';

interface AdministradorPanelProps {
  user: AuthUser;
}

export const AdministradorPanel: React.FC<AdministradorPanelProps> = ({ user }) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Machinery fleet state
  const [fleet] = useState([
    {
      id: 'EQ-01',
      name: 'Sonda Diamantina Atlas Copco CS14',
      status: 'OPERATIVA',
      location: 'Frente Las Bambas',
      hours: '3,420 hrs',
      operator: 'Cuadrilla Alpha',
    },
    {
      id: 'EQ-02',
      name: 'Sonda Hidráulica Longyear LF90',
      status: 'OPERATIVA',
      location: 'Proyecto Antamina',
      hours: '2,180 hrs',
      operator: 'Cuadrilla Beta',
    },
    {
      id: 'EQ-03',
      name: 'Penetrómetro de Cono CPTu Gouda',
      status: 'MANTENIMIENTO',
      location: 'Taller Central Lima',
      hours: '890 hrs',
      operator: 'En servicio preventivo',
    },
    {
      id: 'EQ-04',
      name: 'Sismógrafo de Refracción Geometrics 24 Canales',
      status: 'OPERATIVA',
      location: 'Túnel Trasandino',
      hours: '640 hrs',
      operator: 'Equipo Geofísica',
    },
  ]);

  useEffect(() => {
    fetch('/api/authorized-emails')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.emails) {
          setEmails(data.emails);
        }
      })
      .catch((err) => console.error('Error fetching authorized emails:', err));
  }, []);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      setStatusMsg({ text: 'Por favor ingrese un correo válido.', type: 'error' });
      return;
    }

    setIsAddingEmail(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/authorized-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al autorizar correo.');
      }

      setEmails(data.emails);
      setNewEmail('');
      setStatusMsg({
        text: `Correo "${newEmail.trim()}" incorporado exitosamente al padrón de GEOCIENCES S.A.C. Ahora podrá acceder vía Google OAuth.`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setIsAddingEmail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in text-zinc-900">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-zinc-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Users2 className="w-3.5 h-3.5" />
              <span>Administración Central & Logística • GEOCIENCES S.A.C.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Panel del Administrador
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
              Bienvenido, <strong className="text-white">{user.displayName}</strong>. Control de
              padrón de correos autorizados para Google OAuth, asignación de equipos de perforación y
              recursos de obra.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-right shrink-0">
            <span className="text-[11px] text-stone-300 block uppercase font-mono">
              Personal Autorizado Activo
            </span>
            <span className="text-2xl font-black text-blue-400 font-mono">
              {emails.length} Cuentas
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Whitelist Management (Crucial for Google OAuth control) */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-zinc-900">Padrón de Correos Autorizados</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Google OAuth Filter
            </span>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Las cuentas añadidas aquí reciben habilitación inmediata en el servidor para acceder a
            través de <strong>CONECTAR CON GOOGLE</strong>.
          </p>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Add email form */}
          <form onSubmit={handleAddEmail} className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nuevo.usuario@gmail.com"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={isAddingEmail}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isAddingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Habilitar</span>
            </button>
          </form>

          {/* List of currently authorized emails */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pt-2 border-t border-zinc-100">
            {emails.map((em) => (
              <div
                key={em}
                className="px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs"
              >
                <span className="font-mono text-zinc-800 truncate max-w-[200px]">{em}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Habilitado
                </span>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Todos los correos con terminación <strong>@geosciences.pe</strong> están autorizados automáticamente.</span>
          </div>
        </div>

        {/* Machinery and Rig Fleet */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-zinc-900">
                Parque de Maquinaria y Equipos de Perforación
              </h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500">4 Unidades en Registro</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fleet.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all bg-zinc-50/50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.id}
                    </span>
                    <h3 className="font-bold text-sm text-zinc-900 mt-1">{item.name}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.status === 'OPERATIVA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-zinc-600 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Ubicación:</span>
                    <span className="font-semibold text-zinc-800">{item.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Horómetro:</span>
                    <span className="font-mono text-zinc-800">{item.hours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Asignación:</span>
                    <span className="text-zinc-800">{item.operator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Admin Actions */}
          <div className="pt-4 border-t border-zinc-100 flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
              <Boxes className="w-4 h-4 text-zinc-600" />
              <span>Inventario de Insumos (Bentonita, Aditivos)</span>
            </button>
            <button className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 text-zinc-600" />
              <span>Exportar Reporte de Costos Operativos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
