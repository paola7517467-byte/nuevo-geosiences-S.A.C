import React, { useState, useEffect, useRef } from 'react';
import { CargoRole } from '../types';
import { Eye, EyeOff, ShieldCheck, AlertTriangle, Lock, Loader2 } from 'lucide-react';

interface PasswordModalProps {
  role: CargoRole;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: CargoRole) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  role,
  userEmail,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Por favor ingrese la contraseña del cargo.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Security mandate: Validation is performed strictly on the backend
      const response = await fetch('/api/auth/verify-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          password: password.trim(),
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'CONTRASEÑA INCORRECTA');
        // Do not close modal or change screen on failure
        setPassword('');
        inputRef.current?.focus();
        return;
      }

      // Password validated successfully by backend
      onSuccess(role);
      onClose();
    } catch (err) {
      console.error('Error verifying role password:', err);
      setErrorMessage('Error de conexión al validar con el servidor. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      {/* Ventana central de color blanco */}
      <div className="bg-white text-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 transform transition-all">
        {/* Header con título del cargo */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Lock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
                Control de Acceso Seguro
              </span>
              <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                INGRESE LA CONTRASEÑA DE {role}
              </h3>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-xs text-zinc-600 leading-relaxed">
            Se requiere confirmación de clave criptográfica de seguridad para habilitar los permisos
            operativos del cargo de <strong className="text-zinc-900">{role}</strong> para{' '}
            <span className="font-mono text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded text-[11px]">
              {userEmail}
            </span>
            .
          </p>

          {/* Campo de contraseña con puntos ocultos e icono para mostrar/ocultar */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wide">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading}
                placeholder="••••••"
                autoComplete="off"
                className={`w-full px-4 py-3 pr-12 rounded-xl text-base tracking-widest font-mono border ${
                  errorMessage
                    ? 'border-red-500 bg-red-50/40 text-red-900 focus:ring-red-500 focus:border-red-500'
                    : 'border-zinc-300 bg-white text-zinc-900 focus:ring-zinc-900 focus:border-zinc-900'
                } focus:outline-none focus:ring-2 transition-colors disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors rounded-lg"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de error (CONTRASEÑA INCORRECTA) */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-sm font-semibold animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botones INGRESAR y CANCELAR */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-zinc-900 hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>VALIDANDO...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>INGRESAR</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-1">
            <span className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Validación protegida en servidor GEOCIENCES S.A.C.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
