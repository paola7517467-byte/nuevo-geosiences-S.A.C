import React, { useState } from 'react';
import { AuthUser } from '../../types';
import {
  Hammer,
  Clock,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  HardHat,
  Shield,
  Send,
  Sparkles,
} from 'lucide-react';

interface ObreroPanelProps {
  user: AuthUser;
}

export const ObreroPanel: React.FC<ObreroPanelProps> = ({ user }) => {
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null);

  const [eppItems, setEppItems] = useState([
    { id: 1, label: 'Casco de seguridad tipo ala completa con barbiquejo', checked: true },
    { id: 2, label: 'Lentes de seguridad con protección lateral anti-empañante', checked: true },
    { id: 3, label: 'Guantes de nitrilo / cuero anticorte nivel 5', checked: true },
    { id: 4, label: 'Protector auditivo tipo copa para ruido de perforación', checked: false },
    { id: 5, label: 'Botas de seguridad dieléctricas con punta de acero', checked: true },
    { id: 6, label: 'Respirador para polvo mineral con filtros P100', checked: true },
  ]);

  const [incidentReport, setIncidentReport] = useState('');
  const [incidentReported, setIncidentReported] = useState(false);

  const toggleEpp = (id: number) => {
    setEppItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleMarkAttendance = () => {
    const time = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    setAttendanceTime(time);
    setAttendanceMarked(true);
  };

  const handleSendIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentReport.trim()) return;
    setIncidentReported(true);
    setIncidentReport('');
    setTimeout(() => setIncidentReported(false), 5000);
  };

  const allEppChecked = eppItems.every((item) => item.checked);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in text-zinc-900">
      {/* Banner */}
      <div className="bg-gradient-to-r from-orange-950 via-stone-900 to-zinc-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-orange-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold border border-orange-500/30">
              <Hammer className="w-3.5 h-3.5" />
              <span>Personal Operativo de Frente • GEOCIENCES S.A.C.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Panel del Operador y Cuadrilla
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
              Bienvenido, <strong className="text-white">{user.displayName}</strong>. Registro diario
              de asistencia, checklist obligatorio de EPP para inicio de guardia y reporte inmediato
              de condiciones en campo.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-right shrink-0">
            <span className="text-[11px] text-stone-300 block uppercase font-mono">
              Guardia Asignada
            </span>
            <span className="text-xl font-black text-orange-400 font-mono">
              TURNO DÍA (07:00 - 19:00)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Marking */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-bold text-zinc-900">Marcación de Asistencia</h2>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-500">Frente Minero</span>
          </div>

          <div className="text-center py-4 space-y-3">
            {attendanceMarked ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm text-emerald-950">Asistencia Registrada</h3>
                <p className="text-xs text-emerald-800">
                  Ingreso confirmado a las <strong>{attendanceTime}</strong> hrs.
                </p>
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200/60 text-emerald-900">
                  Sello biométrico validado
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-zinc-600">
                  Presione el botón para marcar su ingreso a la guardia de perforación y geotecnia.
                </p>
                <button
                  onClick={handleMarkAttendance}
                  className="w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>MARCAR INGRESO A GUARDIA</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-orange-600" />
            <span>Coordenadas UTM registradas automáticamente en el sistema de seguridad.</span>
          </div>
        </div>

        {/* EPP Checklist */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <HardHat className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-bold text-zinc-900">Checklist Diario de EPP</h2>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                allEppChecked
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {allEppChecked ? 'COMPLETO' : 'PENDIENTE'}
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            Verifique el estado y porte obligatorio de sus elementos de protección personal antes de
            encender la maquinaria.
          </p>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {eppItems.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleEpp(item.id)}
                className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                  item.checked
                    ? 'bg-emerald-50/50 border-emerald-200 text-zinc-800'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300'
                }`}
              >
                {item.checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                )}
                <span className={item.checked ? 'font-medium' : ''}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Incident and Hazard Reporting */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-bold text-zinc-900">Reporte de Seguridad en Frente</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Canal Directo HSE</span>
          </div>

          <p className="text-xs text-zinc-500">
            ¿Detectó alguna condición subestándar (derrame de fluido, fisura en talud, manguera con
            fuga)? Infórmelo inmediatamente.
          </p>

          {incidentReported && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Reporte transmitido al supervisor residente y cuadrilla de rescate.</span>
            </div>
          )}

          <form onSubmit={handleSendIncident} className="space-y-2">
            <textarea
              value={incidentReport}
              onChange={(e) => setIncidentReport(e.target.value)}
              placeholder="Describa el peligro o condición observada..."
              rows={3}
              className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 bg-zinc-50/50"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-orange-400" />
              <span>Enviar Alerta al Residente</span>
            </button>
          </form>

          <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-[11px] text-orange-900 font-medium">
            <strong>Regla de Oro:</strong> Todo trabajador tiene la autoridad y el deber de detener
            cualquier labor si considera que las condiciones no son seguras.
          </div>
        </div>
      </div>
    </div>
  );
};
