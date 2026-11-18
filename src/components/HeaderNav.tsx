import React from 'react';
import { CargoRole, AuthUser } from '../types';
import {
  Compass,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  Users2,
  HardHat,
  Hammer,
} from 'lucide-react';

interface HeaderNavProps {
  user: AuthUser;
  activeRole: CargoRole;
  onSwitchCargo: () => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  user,
  activeRole,
  onSwitchCargo,
  onLogout,
}) => {
  const getRoleBadge = (role: CargoRole) => {
    switch (role) {
      case 'GERENTE':
        return {
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          icon: <Briefcase className="w-4 h-4 text-amber-400" />,
          label: 'PANEL DE GERENTE',
        };
      case 'ADMINISTRADOR':
        return {
          bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          icon: <Users2 className="w-4 h-4 text-blue-400" />,
          label: 'PANEL DE ADMINISTRADOR',
        };
      case 'RESIDENTE':
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          icon: <HardHat className="w-4 h-4 text-emerald-400" />,
          label: 'PANEL DE RESIDENTE',
        };
      case 'OBRERO':
        return {
          bg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
          icon: <Hammer className="w-4 h-4 text-orange-400" />,
          label: 'PANEL DE OBRERO',
        };
    }
  };

  const badge = getRoleBadge(activeRole);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-white sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
        {/* Company Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
            <Compass className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white">
                GEOCIENCES <span className="text-red-500">S.A.C.</span>
              </span>
              <div
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono">
              SESIÓN AUTORIZADA POR SERVIDOR
            </p>
          </div>
        </div>

        {/* Center Badge on mobile */}
        <div
          className={`md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.bg}`}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </div>

        {/* Actions & User Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* User Profile */}
          <div className="flex items-center gap-2.5 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center font-bold text-xs uppercase">
                {user.displayName.substring(0, 2)}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                <span className="truncate max-w-[130px]">{user.displayName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-400 truncate max-w-[150px]">
                {user.email}
              </div>
            </div>
          </div>

          {/* Switch Cargo Button */}
          <button
            onClick={onSwitchCargo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition-colors cursor-pointer"
            title="Regresar a la selección de cargo"
          >
            <RefreshCw className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Cambiar de Cargo</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
