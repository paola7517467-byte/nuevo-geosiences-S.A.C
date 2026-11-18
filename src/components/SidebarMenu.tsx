import React from 'react';
import { CargoRole, AuthUser } from '../types';
import {
  Home,
  FileSpreadsheet,
  Briefcase,
  ShieldAlert,
  User,
  FolderOpen,
  X,
  Compass,
  ExternalLink,
} from 'lucide-react';

interface SidebarMenuProps {
  isOpen: boolean;
  cargo: CargoRole;
  user: AuthUser;
  onClose: () => void;
  onSelectOption: (option: 'HOME' | 'INFORMES' | 'ROL' | 'PROTOCOLOS' | 'PERFIL') => void;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({
  isOpen,
  cargo,
  user,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  const driveLinks: Record<CargoRole, string> = {
    GERENTE: 'https://drive.google.com/drive/folders/183ypBi1mbiVwISN91GnzHPVPhQRwwHSn?usp=sharing',
    ADMINISTRADOR:
      'https://drive.google.com/drive/folders/1n5_nzg23lMnRlG3X4z8wgg3jrokyeP-v?usp=sharing',
    RESIDENTE:
      'https://drive.google.com/drive/folders/1n0Xi_6tTD6zBNLOaNKvzmT5KVL2byfPR?usp=sharing',
    OBRERO:
      'https://drive.google.com/drive/folders/16tMDzhLyCtoxPrnwGrET-E9CyMXUg6Gj?usp=sharing',
  };

  const handleDriveClick = () => {
    window.open(driveLinks[cargo], '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Dark Sliding Panel covering approx half the screen */}
      <aside className="relative z-10 w-full max-w-[85vw] sm:max-w-[50vw] md:max-w-[42vw] lg:max-w-[32vw] bg-zinc-950 text-white h-full shadow-2xl flex flex-col justify-between border-r border-zinc-800 animate-slide-left">
        {/* Top Header of Sidebar */}
        <div>
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wider text-white">
                  GEOCIENCES <span className="text-red-500">S.A.C.</span>
                </span>
                <p className="text-[10px] text-zinc-400 font-mono">MENÚ PRINCIPAL</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User profile snippet */}
          <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-9 h-9 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center font-bold text-xs">
                {user.displayName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user.displayName}</div>
              <div className="text-[10px] font-mono text-zinc-400 truncate">{cargo}</div>
            </div>
          </div>

          {/* 6 Mandatory Options in Exact Required Order:
              1. CASITA
              2. INFORMES
              3. ROL
              4. PROTOCOLOS DE SEGURIDAD
              5. PERFIL
              6. DRIVE
          */}
          <nav className="p-4 space-y-1.5">
            {/* 1. CASITA */}
            <button
              onClick={() => {
                onSelectOption('HOME');
                onClose();
              }}
              className="w-full p-3 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-white transition-all flex items-center gap-3 text-xs font-bold uppercase tracking-wider group cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-red-600 text-zinc-300 group-hover:text-white transition-colors">
                <Home className="w-4 h-4" />
              </div>
              <span>CASITA</span>
            </button>

            {/* 2. INFORMES */}
            <button
              onClick={() => {
                onSelectOption('INFORMES');
                onClose();
              }}
              className="w-full p-3 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-white transition-all flex items-center gap-3 text-xs font-bold uppercase tracking-wider group cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-emerald-600 text-zinc-300 group-hover:text-white transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span>INFORMES</span>
            </button>

            {/* 3. ROL */}
            <button
              onClick={() => {
                onSelectOption('ROL');
                onClose();
              }}
              className="w-full p-3 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-white transition-all flex items-center gap-3 text-xs font-bold uppercase tracking-wider group cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-blue-600 text-zinc-300 group-hover:text-white transition-colors">
                <Briefcase className="w-4 h-4" />
              </div>
              <span>ROL</span>
            </button>

            {/* 4. PROTOCOLOS DE SEGURIDAD */}
            <button
              onClick={() => {
                onSelectOption('PROTOCOLOS');
                onClose();
              }}
              className="w-full p-3 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-white transition-all flex items-center gap-3 text-xs font-bold uppercase tracking-wider group cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-amber-600 text-zinc-300 group-hover:text-white transition-colors">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span>PROTOCOLOS DE SEGURIDAD</span>
            </button>

            {/* 5. PERFIL */}
            <button
              onClick={() => {
                onSelectOption('PERFIL');
                onClose();
              }}
              className="w-full p-3 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-white transition-all flex items-center gap-3 text-xs font-bold uppercase tracking-wider group cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-purple-600 text-zinc-300 group-hover:text-white transition-colors">
                <User className="w-4 h-4" />
              </div>
              <span>PERFIL</span>
            </button>

            {/* 6. DRIVE */}
            <button
              onClick={handleDriveClick}
              className="w-full p-3 rounded-xl hover:bg-zinc-900 text-zinc-200 hover:text-white transition-all flex items-center justify-between text-xs font-bold uppercase tracking-wider group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-900 group-hover:bg-amber-500 text-zinc-300 group-hover:text-white transition-colors">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <span>DRIVE</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
            </button>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 text-[11px] text-zinc-500 font-mono text-center">
          GEOCIENCES S.A.C. • v2.6
        </div>
      </aside>
    </div>
  );
};
