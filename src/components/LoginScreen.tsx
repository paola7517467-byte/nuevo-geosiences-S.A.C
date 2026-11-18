import React, { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { AuthUser } from '../types';
import {
  ShieldAlert,
  CheckCircle2,
  Lock,
  Mail,
  Building2,
  AlertCircle,
  Loader2,
  Info,
  Compass,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isStandardLoading, setIsStandardLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRosterModal, setShowRosterModal] = useState(false);

  // Real Google OAuth 2.0 Authentication handler
  const handleGoogleConnect = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      // 1 & 2. Open official Google popup with account selector
      const result = await signInWithPopup(auth, googleAuthProvider);
      const googleUser = result.user;

      if (!googleUser || !googleUser.email) {
        throw new Error('No se pudo recuperar el correo electrónico de la cuenta de Google seleccionada.');
      }

      const userEmail = googleUser.email.toLowerCase().trim();

      // 4 & 5. Verify authorization for GEOCIENCES S.A.C. against backend
      const response = await fetch('/api/auth/verify-google-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          displayName: googleUser.displayName || userEmail.split('@')[0],
          photoURL: googleUser.photoURL || '',
          uid: googleUser.uid,
        }),
      });

      const data = await response.json();

      // 7. If user is not authorized in GEOCIENCES S.A.C.
      if (!response.ok || !data.authorized) {
        // Sign out from Firebase to maintain zero unauthorized footprint
        await signOut(auth);

        setErrorMessage(
          data.message ||
            `Acceso no autorizado: El correo "${userEmail}" no se encuentra registrado en el padrón del personal de GEOCIENCES S.A.C. Por favor contacte con la gerencia para solicitar su habilitación.`
        );
        return;
      }

      // 6. Authorized: continue to role selection screen
      const authorizedUser: AuthUser = {
        uid: googleUser.uid,
        email: userEmail,
        displayName: googleUser.displayName || 'Personal Geosciences',
        photoURL: googleUser.photoURL || undefined,
        isAuthorized: true,
        activeRole: null,
        authProvider: 'google',
      };

      onLoginSuccess(authorizedUser);
    } catch (error: any) {
      console.warn('Google Auth interaction:', error);

      // Handle user cancellation or closing popup
      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        setInfoMessage(
          'Autenticación cancelada: La ventana oficial de Google fue cerrada sin autorizar el acceso. Puede volver a presionar "CONECTAR CON GOOGLE" cuando desee identificarse.'
        );
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMessage('Error de conexión a los servidores de autenticación de Google. Verifique su red.');
      } else {
        setErrorMessage(
          error.message || 'Ocurrió un error inesperado al procesar la autenticación con Google.'
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Standard login (email + required user key password)
  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Por favor ingrese su correo electrónico personal o institucional.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Por favor ingrese su clave de usuario para acceder al sistema.');
      return;
    }

    setIsStandardLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          displayName: email.split('@')[0],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.authorized) {
        setErrorMessage(
          data.message ||
            'Clave de usuario incorrecta o correo no habilitado para ingresar al sistema.'
        );
        return;
      }

      onLoginSuccess({
        uid: `corp-${Date.now()}`,
        email: email.trim().toLowerCase(),
        displayName: email.split('@')[0],
        isAuthorized: true,
        activeRole: null,
        authProvider: 'corporate',
      });
    } catch {
      setErrorMessage('Error al verificar credenciales de acceso.');
    } finally {
      setIsStandardLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#120822] text-purple-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Subtle atmospheric dark-purple radial depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(126,34,206,0.22),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(88,28,135,0.25),_transparent_55%)]"
      />

      {/* Top Banner / Corporate Identity */}
      <header className="border-b border-purple-800/50 bg-[#180b2d]/90 backdrop-blur-md sticky top-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950 flex items-center justify-center text-white shadow-sm ring-1 ring-purple-500/40">
              <Compass className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white whitespace-nowrap">
                GEOCIENCES <span className="text-red-400">S.A.C.</span>
              </span>
              <p className="text-[11px] font-medium text-purple-300/80 tracking-wide">
                INGENIERÍA GEOTÉCNICA & EXPLORACIONES MINERAS
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center text-xs font-medium text-purple-200/80 whitespace-nowrap">
            <span>Sistema Central de Operaciones</span>
          </div>
        </div>
      </header>

      {/* Main Content Area: Dark Purple Background with Centered Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-[#1c0e35] rounded-2xl shadow-2xl shadow-black/60 border border-purple-700/40 overflow-hidden">
            {/* Accent Brand Strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-red-500" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Card Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 text-purple-300 text-xs font-semibold tracking-wide">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Portal Institucional de Acceso</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight text-balance">
                  Identificación de Personal
                </h1>
                <p className="text-xs text-purple-200/80 max-w-xs mx-auto leading-relaxed">
                  Ingrese con cualquier correo personal o institucional, o conecte con su cuenta de
                  Google para acceder a los cargos de obra.
                </p>
              </div>

              {/* Informative Message (e.g. cancellation) */}
              {infoMessage && (
                <div className="p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-xl flex items-start gap-3 text-amber-100 text-xs leading-relaxed animate-fade-in">
                  <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-200">Aviso del Sistema</span>
                    {infoMessage}
                  </div>
                </div>
              )}

              {/* Error Message (e.g. unauthorized email) */}
              {errorMessage && (
                <div className="p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-100 text-xs leading-relaxed animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <div>
                    <span className="font-bold block text-red-200">Acceso Denegado</span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Standard Login Form */}
              <form onSubmit={handleStandardLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-purple-200 tracking-wide">
                    Correo (Personal o Institucional)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@gmail.com o nombre@geosciences.pe"
                      className="w-full px-4 py-2.5 pl-10 rounded-xl text-sm text-white placeholder:text-purple-400/50 border border-purple-700/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors bg-[#130826]"
                    />
                    <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-purple-200 tracking-wide">
                      Clave de Usuario
                    </label>
                    <span className="text-[11px] text-purple-300/80">Requerida</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      inputMode="numeric"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingrese la clave de usuario"
                      className="w-full px-4 py-2.5 pl-10 pr-10 rounded-xl text-sm text-white placeholder:text-purple-400/50 border border-purple-700/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-colors bg-[#130826]"
                    />
                    <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isStandardLoading || isGoogleLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isStandardLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Comprobando Habilitación...</span>
                    </>
                  ) : (
                    <span>INGRESAR AL SISTEMA</span>
                  )}
                </button>
              </form>

              {/* Separator */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-purple-800/60 w-full" />
                <span className="bg-[#1c0e35] px-3 text-[11px] uppercase tracking-wider font-semibold text-purple-300/70 absolute">
                  O AUTENTICAR CON
                </span>
              </div>

              {/* REQUIRED SECONDARY BUTTON WITH RED BORDER: CONECTAR CON GOOGLE */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleConnect}
                  disabled={isGoogleLoading || isStandardLoading}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-sm tracking-wide text-white bg-[#241242] hover:bg-[#2d1752] border-2 border-red-500 hover:border-red-400 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                      <span>ABRIENDO SELECTOR DE GOOGLE...</span>
                    </>
                  ) : (
                    <>
                      {/* Official Google G Logo */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>CONECTAR CON GOOGLE</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-purple-200/80 font-medium">
                  Ventana oficial de autenticación Google OAuth 2.0.
                  <br />
                  <span className="text-purple-300/60">
                    Cualquier correo personal o institucional puede ingresar.
                  </span>
                </p>
              </div>

              {/* Access Information Link */}
              <div className="pt-2 border-t border-purple-800/50 flex items-center justify-between text-xs text-purple-300/80">
                <button
                  type="button"
                  onClick={() => setShowRosterModal(true)}
                  className="hover:text-purple-100 font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span>Política de acceso</span>
                </button>
                <span className="text-[11px] text-purple-400/70">GEOCIENCES S.A.C.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-800/40 bg-[#180b2d]/90 py-4 px-6 text-center text-xs text-purple-300/75">
        <p>
          © 2026 GEOCIENCES S.A.C. Todos los derechos reservados. Acceso habilitado para cuentas
          personales e institucionales.
        </p>
      </footer>

      {/* Info Modal for Access Policy */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1c0e35] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-purple-700/50 text-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-900/70 text-purple-300 rounded-xl border border-purple-600/40">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Política de Acceso al Portal</h3>
                <p className="text-xs text-purple-300/80">GEOCIENCES S.A.C.</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-purple-100/90 leading-relaxed bg-[#130826] p-3.5 rounded-xl border border-purple-800/60">
              <p>
                Cualquier usuario puede identificarse con su correo electrónico personal o
                institucional para ingresar al portal:
              </p>
              <ul className="space-y-1.5 font-mono text-[11px] text-purple-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Correos personales (@gmail.com, @hotmail.com, etc.)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Correos institucionales (@geosciences.pe, corporativos)</span>
                </li>
              </ul>
              <p className="text-[11px] text-purple-300/75 pt-1">
                Una vez identificado, el ingreso a cada panel (Gerente, Administrador, Residente u
                Obrero) se protege mediante su contraseña de cargo correspondiente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowRosterModal(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
