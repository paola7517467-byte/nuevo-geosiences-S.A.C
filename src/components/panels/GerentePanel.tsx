import React, { useState, useEffect } from 'react';
import { AuthUser, AuditLogItem } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Activity,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Layers,
  Award,
  AlertCircle,
} from 'lucide-react';

interface GerentePanelProps {
  user: AuthUser;
}

export const GerentePanel: React.FC<GerentePanelProps> = ({ user }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [approvals, setApprovals] = useState([
    {
      id: 'AP-101',
      project: 'Sondaje Diamantino Las Bambas - Fase IV',
      type: 'Ampliación de Metraje (+450m)',
      amount: '$142,500 USD',
      solicitedBy: 'Ing. Residente M. Torres',
      status: 'PENDING',
    },
    {
      id: 'AP-102',
      project: 'Geotecnia Minera Antamina - Zona Sur',
      type: 'Adquisición de Corona Diamantada HQ3',
      amount: '$28,400 USD',
      solicitedBy: 'Logística / Admin',
      status: 'PENDING',
    },
    {
      id: 'AP-103',
      project: 'Estudio de Refracción Sísmica Túnel Trasandino',
      type: 'Certificación Final de Ensayos Geofísicos',
      amount: '$65,000 USD',
      solicitedBy: 'Dr. C. Mendoza',
      status: 'APPROVED',
    },
  ]);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.logs) {
          setAuditLogs(data.logs);
        }
      })
      .catch((err) => console.error('Error loading audit logs:', err));
  }, []);

  const handleAction = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in text-zinc-900">
      {/* Executive Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-zinc-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              <span>Alta Gerencia Ejecutiva • GEOCIENCES S.A.C.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Panel de Control Gerencial
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
              Bienvenido, <strong className="text-white">{user.displayName}</strong>. Supervisión
              estratégica, balance financiero de exploraciones geotécnicas y auditoría de seguridad
              operativa.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-right shrink-0">
            <span className="text-[11px] text-stone-300 block uppercase font-mono">
              Presupuesto Global Activo
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono">$4,850,000 USD</span>
          </div>
        </div>
      </div>

      {/* High-Level Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Proyectos de Obra</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900">12 Obras</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 100% operando en cronograma
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Metraje Perforado</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono">18,420 m</div>
          <p className="text-[11px] text-zinc-500 font-medium mt-1">Perforación diamantina acumulada</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Margen Operativo</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">26.4 %</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">+2.8% sobre meta Q1</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Índice Seguridad HSE</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900 font-mono">0.00 TRIFR</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Cero accidentes incapacitantes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-zinc-900">
                Aprobación de Requerimientos de Inversión y Adendas
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Gerencia General
            </span>
          </div>

          <div className="space-y-3">
            {approvals.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-zinc-500">{item.id}</span>
                    <span className="font-bold text-sm text-zinc-900">{item.project}</span>
                  </div>
                  <p className="text-xs text-zinc-600">{item.type}</p>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                    <span>Monto: <strong className="text-zinc-900">{item.amount}</strong></span>
                    <span>•</span>
                    <span>Solicita: {item.solicitedBy}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleAction(item.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleAction(item.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rechazar
                      </button>
                    </>
                  ) : item.status === 'APPROVED' ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Aprobado
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rechazado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Audit Trail */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold text-zinc-900">Auditoría del Sistema</h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">En Vivo</span>
          </div>

          <p className="text-xs text-zinc-500">
            Registro cronológico de autenticaciones Google OAuth y comprobación de claves de cargos.
          </p>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-4">No hay registros recientes.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-zinc-100 bg-zinc-50/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-zinc-700 truncate max-w-[170px]">
                      {log.email}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-600">
                    <strong className="text-zinc-800">{log.action}</strong>
                    {log.role && ` • Cargo: ${log.role}`}
                  </div>
                  {log.details && (
                    <p className="text-[10px] text-zinc-500 leading-tight">{log.details}</p>
                  )}
                  <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 pt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
