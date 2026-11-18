import React, { useState } from 'react';
import { CargoRole } from '../types';
import { INITIAL_ROLES_DATA, RoleDetail } from '../data/rolesData';
import {
  Briefcase,
  X,
  Edit2,
  Save,
  CheckCircle2,
  Shield,
  Layers,
  Award,
} from 'lucide-react';

interface RoleModalProps {
  cargo: CargoRole;
  isOpen: boolean;
  onClose: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({ cargo, isOpen, onClose }) => {
  const [roleData, setRoleData] = useState<RoleDetail>(INITIAL_ROLES_DATA[cargo]);
  const [isEditing, setIsEditing] = useState(false);
  const [responsibilitiesText, setResponsibilitiesText] = useState(
    INITIAL_ROLES_DATA[cargo].responsibilities.join('\n')
  );
  const [scopeText, setScopeText] = useState(INITIAL_ROLES_DATA[cargo].scope);
  const [savedNotification, setSavedNotification] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = {
      ...roleData,
      scope: scopeText,
      responsibilities: responsibilitiesText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    };
    setRoleData(updated);
    setIsEditing(false);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white text-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-stone-400 uppercase">
                GEOCIENCES S.A.C. • MANUAL DE ORGANIZACIÓN Y FUNCIONES
              </span>
              <h2 className="text-base font-extrabold text-white">{roleData.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-xs text-stone-700">
          {savedNotification && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Descripción de responsabilidades actualizada con éxito.</span>
            </div>
          )}

          {/* Scope & Hierarchy */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-red-600" /> Alcance y Jerarquía Operativa
              </span>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar Funciones</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={scopeText}
                onChange={(e) => setScopeText(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            ) : (
              <p className="text-stone-600 leading-relaxed">{roleData.scope}</p>
            )}

            <div className="text-[11px] font-mono text-stone-500">
              Nivel: <strong>{roleData.hierarchy}</strong>
            </div>
          </div>

          {/* Responsibilities list */}
          <div className="space-y-2.5">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5 uppercase">
              <Layers className="w-4 h-4 text-blue-600" /> Responsabilidades Específicas del Cargo
            </h3>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={responsibilitiesText}
                  onChange={(e) => setResponsibilitiesText(e.target.value)}
                  rows={8}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                  placeholder="Escriba cada responsabilidad en una nueva línea..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            ) : (
              <ul className="space-y-2">
                {roleData.responsibilities.map((r, i) => (
                  <li
                    key={i}
                    className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {i + 1}
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Key Objectives */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-1.5 uppercase">
              <Award className="w-4 h-4 text-amber-600" /> Objetivos de Desempeño
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-600">
              {roleData.keyObjectives.map((obj, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-[11px] leading-snug"
                >
                  <strong className="text-amber-950 block mb-1">Meta 0{i + 1}:</strong>
                  {obj}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-400 font-mono">
            Modificación restringida a personal directivo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
