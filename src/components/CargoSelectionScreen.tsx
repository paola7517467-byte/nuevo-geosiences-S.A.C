import React from 'react';
import { CargoRole, AuthUser } from '../types';
import {
  Briefcase,
  Users2,
  HardHat,
  Hammer,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Compass,
} from 'lucide-react';

interface CargoSelectionScreenProps {
  user: AuthUser;
  onSelectCargo: (role: CargoRole) => void;
  onLogout: () => void;
}

interface CargoCardDef {
  id: CargoRole;
  number: string;
  title: string;
  category: string;
  description: string;
  badge: string;
  accentBorder: string;
  accentBg: string;
  iconBg: string;
  textColor: string;
  icon: React.ReactNode;
}

export const CargoSelectionScreen: React.FC<CargoSelectionScreenProps> = ({
  user,
  onSelectCargo,
  onLogout,
}) => {
  const cargos: CargoCardDef[] = [
    {
      id: 'GERENTE',
      number: '01',
      title: 'GERENTE',
      category: 'ALTA DIRECCIÓN',
      description:
        'Control directivo global, aprobación de presupuestos de exploración, balances de proyectos y auditoría general.',
      badge: 'Nivel Ejecutivo',
      accentBorder: 'hover:border-amber-500/80 hover:shadow-amber-500/10',
      accentBg: 'from-amber-950/30 to-black',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      textColor: 'group-hover:text-amber-400',
      icon: <Briefcase className="w-8 h-8" />,
    },
    {
      id: 'ADMINISTRADOR',
      number: '02',
      title: 'ADMINISTRADOR',
      category: 'GESTIÓN & OPERACIONES',
      description:
        'Administración de padrón de personal, logística de maquinaria pesada, órdenes de compra y contratos de obra.',
      badge: 'Nivel Operativo Central',
      accentBorder: 'hover:border-blue-500/80 hover:shadow-blue-500/10',
      accentBg: 'from-blue-950/30 to-black',
      iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      textColor: 'group-hover:text-blue-400',
      icon: <Users2 className="w-8 h-8" />,
    },
    {
      id: 'RESIDENTE',
      number: '03',
      title: 'RESIDENTE',
      category: 'SUPERVISIÓN TÉCNICA EN CAMPO',
      description:
        'Jefatura técnica en obra, cuaderno digital, sondajes diamantinos, ensayos geotécnicos y control HSE.',
      badge: 'Nivel Técnico',
      accentBorder: 'hover:border-emerald-500/80 hover:shadow-emerald-500/10',
      accentBg: 'from-emerald-950/30 to-black',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      textColor: 'group-hover:text-emerald-400',
      icon: <HardHat className="w-8 h-8" />,
    },
    {
      id: 'OBRERO',
      number: '04',
      title: 'OBRERO',
      category: 'OPERADOR DE FRENTE & CUADRILLA',
      description:
        'Control de asistencia en frente, inspección de EPP diario, registro de horas de perforación y reporte de condiciones.',
      badge: 'Nivel Campo',
      accentBorder: 'hover:border-orange-500/80 hover:shadow-orange-500/10',
      accentBg: 'from-orange-950/30 to-black',
      iconBg: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      textColor: 'group-hover:text-orange-400',
      icon: <Hammer className="w-8 h-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shadow-inner">
              <Compass className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-white">
                  GEOCIENCES <span className="text-red-500">S.A.C.</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">
                  PORTAL SEGURO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Sistema Corporativo de Asignación de Roles
              </p>
            </div>
          </div>

          {/* User Session Info & Logout Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 bg-zinc-900/90 px-3.5 py-2 rounded-xl border border-zinc-800">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-xs uppercase">
                  {user.displayName.substring(0, 2)}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <span>{user.displayName}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-zinc-400 truncate max-w-[200px]">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4 text-zinc-400" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Black Background with Large Separated Buttons */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col justify-center">
        {/* Title Section */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Acceso Autorizado por Credenciales</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            SELECCIONAR CARGO
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Presione el cargo asignado a sus funciones operativas en GEOCIENCES S.A.C. para ingresar la
            contraseña de seguridad correspondiente.
          </p>
        </div>

        {/* Four Large, Separated, Easy-to-Press Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {cargos.map((cargo) => (
            <button
              key={cargo.id}
              onClick={() => onSelectCargo(cargo.id)}
              className={`group relative text-left p-6 sm:p-7 rounded-2xl bg-gradient-to-b ${cargo.accentBg} border-2 border-zinc-800/90 ${cargo.accentBorder} transition-all duration-200 hover:-translate-y-1 shadow-xl hover:shadow-2xl cursor-pointer flex flex-col justify-between min-h-[170px] sm:min-h-[190px] focus:outline-none focus:ring-2 focus:ring-red-500`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-xl ${cargo.iconBg} transition-transform group-hover:scale-105`}>
                    {cargo.icon}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                      CARGO {cargo.number} • {cargo.category}
                    </span>
                    <h2
                      className={`text-2xl sm:text-3xl font-black tracking-tight text-white ${cargo.textColor} transition-colors flex items-center gap-2`}
                    >
                      <span>{cargo.title}</span>
                    </h2>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-colors shrink-0">
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-zinc-800/80 mt-4 flex items-center justify-between">
                <p className="text-xs text-zinc-400 line-clamp-2 pr-4 leading-relaxed">
                  {cargo.description}
                </p>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {cargo.badge}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Security Banner Footer */}
        <div className="mt-10 p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-between text-xs text-zinc-400 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cada cargo cuenta con una clave criptográfica independiente validada en el backend.</span>
          </div>
          <span className="font-mono text-zinc-400 text-[11px]">
            GEOCIENCES S.A.C. • CONTROL INTERNO
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-6 text-center text-xs text-zinc-400">
        <p>© 2026 GEOCIENCES S.A.C. Acceso confidencial y restringido.</p>
      </footer>
    </div>
  );
};
