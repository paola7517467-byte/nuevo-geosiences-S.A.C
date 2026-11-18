import React, { useState } from 'react';
import { AuthUser } from '../../types';
import {
  HardHat,
  FileText,
  MapPin,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface ResidentePanelProps {
  user: AuthUser;
}

export const ResidentePanel: React.FC<ResidentePanelProps> = ({ user }) => {
  const [drillHoles, setDrillHoles] = useState([
    {
      id: 'DDH-24-08',
      project: 'Minera Las Bambas - Pit Ferrobamba',
      targetDepth: '280.0 m',
      currentDepth: '142.5 m',
      rqd: '84 %',
      recovery: '96.2 %',
      lithology: 'Dacita porfídica alteración potásica con venillas D',
      status: 'EN PERFORACIÓN',
    },
    {
      id: 'DDH-24-09',
      project: 'Presa de Relaves Antamina',
      targetDepth: '120.0 m',
      currentDepth: '120.0 m',
      rqd: '91 %',
      recovery: '99.0 %',
      lithology: 'Caliza masiva estratificada, ensayo Lugeon completado',
      status: 'COMPLETADO',
    },
    {
      id: 'CAL-03',
      project: 'Estabilidad de Taludes Túnel',
      targetDepth: '6.0 m',
      currentDepth: '4.5 m',
      rqd: 'N/A',
      recovery: '100 %',
      lithology: 'Suelo coluvial con gravas angulosas (SPT N=34)',
      status: 'EN ENSAYO',
    },
  ]);

  const [notes, setNotes] = useState([
    {
      id: 'NOTE-1',
      date: '10 Nov 2026 - Guardia Día',
      author: 'Ing. Residente C. Sánchez (CIP 189201)',
      content:
        'Se verificó alineamiento e inclinación (-60° azimut 145°) de sonda CS14 en plataforma P-08. Recuperación excelente en tramo 120m-140m. Se autorizó PETAR para maniobras de izaje.',
    },
  ]);

  const [newNote, setNewNote] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNotes([
      {
        id: `NOTE-${Date.now()}`,
        date: new Date().toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        author: `Ing. ${user.displayName}`,
        content: newNote.trim(),
      },
      ...notes,
    ]);
    setNewNote('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in text-zinc-900">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-zinc-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <HardHat className="w-3.5 h-3.5" />
              <span>Residencia Técnica de Obra • GEOCIENCES S.A.C.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Panel del Ingeniero Residente
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
              Bienvenido, <strong className="text-white">{user.displayName}</strong>. Supervisión de
              ensayos geotécnicos en campo, control de sondajes diamantinos y firma de cuaderno digital
              de obra.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-right shrink-0">
            <span className="text-[11px] text-stone-300 block uppercase font-mono">
              Frente de Operaciones
            </span>
            <span className="text-xl font-black text-emerald-400">
              Sector Ferrobamba / Plataforma 08
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drillholes tracking */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-zinc-900">
                Control de Sondajes Diamantinos y Calicatas Activas
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Norma ASTM D2113
            </span>
          </div>

          <div className="space-y-3">
            {drillHoles.map((dh) => (
              <div
                key={dh.id}
                className="p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 space-y-2 transition-colors"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-zinc-900">{dh.id}</span>
                      <span className="text-xs text-zinc-600">• {dh.project}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{dh.lithology}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      dh.status === 'COMPLETADO'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {dh.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-200/60 text-xs font-mono">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">PROFUNDIDAD</span>
                    <span className="font-bold text-zinc-800">
                      {dh.currentDepth} / {dh.targetDepth}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">RECUPERACIÓN</span>
                    <span className="font-bold text-emerald-700">{dh.recovery}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">ÍNDICE RQD</span>
                    <span className="font-bold text-blue-700">{dh.rqd}</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <button className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center">
                      <span>Ver Testigos</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Site Diary (Cuaderno de Obra) */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-zinc-900">Cuaderno de Obra Digital</h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400">Asiento Nº 248</span>
          </div>

          {/* Add entry form */}
          <form onSubmit={handleAddNote} className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700">
              Registrar Nuevo Asiento Técnico
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Describa el avance del turno, condiciones litológicas observadas o autorizaciones de PETAR..."
              rows={3}
              className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-zinc-50/50"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Firmar Asiento Digital</span>
            </button>
          </form>

          {/* Notes list */}
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pt-2 border-t border-zinc-100">
            {notes.map((n) => (
              <div key={n.id} className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{n.date}</span>
                  <span className="text-emerald-700 font-bold">{n.author}</span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">{n.content}</p>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Firma digital habilitada para inspecciones colegiadas.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
