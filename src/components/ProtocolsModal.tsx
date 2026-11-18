import React from 'react';
import { CargoRole } from '../types';
import { PROTOCOLS_DATA } from '../data/protocols';
import {
  ShieldAlert,
  X,
  FileText,
  Lock,
  CheckCircle2,
  Printer,
  Compass,
} from 'lucide-react';

interface ProtocolsModalProps {
  cargo: CargoRole;
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolsModal: React.FC<ProtocolsModalProps> = ({ cargo, isOpen, onClose }) => {
  if (!isOpen) return null;

  const protocol = PROTOCOLS_DATA[cargo];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white text-stone-900 rounded-2xl max-w-3xl w-full max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase">
                  DOCUMENTO OFICIAL SSOMA
                </span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                  {protocol.version}
                </span>
              </div>
              <h2 className="text-base font-black text-white">{protocol.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle / Non-editable banner */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              <strong>Norma Institucional Obligatoria:</strong> Este protocolo es de cumplimiento
              estricto y no puede ser modificado por los trabajadores.
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-800 hidden sm:inline">
            Vigencia: {protocol.lastUpdated}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left text-xs leading-relaxed text-stone-700">
          <div className="border-l-4 border-red-600 pl-4 py-1">
            <p className="font-bold text-sm text-stone-900">{protocol.subtitle}</p>
            <p className="text-stone-500 text-[11px]">
              Reglamento Interno de Seguridad y Salud Ocupacional en Minería • D.S. 024-2016-EM
            </p>
          </div>

          {protocol.content.map((paragraph, index) => {
            const sections = paragraph.split('\n\n');
            return (
              <div key={index} className="space-y-4">
                {sections.map((sec, secIdx) => (
                  <div
                    key={secIdx}
                    className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 whitespace-pre-line leading-relaxed"
                  >
                    {sec}
                  </div>
                ))}
              </div>
            );
          })}

          {/* Golden Safety Rules Badge */}
          <div className="p-4 bg-stone-900 text-white rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Compromiso de GEOCIENCES S.A.C. con la Vida</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Ningún trabajo es tan urgente ni tan importante que no pueda realizarse de manera segura.
              El cumplimiento de estos protocolos garantiza que cada trabajador regrese a su hogar sano y
              salvo al culminar la campaña.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>Imprimir Protocolo</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            ENTENDIDO Y CONFORME
          </button>
        </div>
      </div>
    </div>
  );
};
