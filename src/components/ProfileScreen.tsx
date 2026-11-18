import React, { useState, useRef } from 'react';
import { AuthUser, CargoRole } from '../types';
import {
  Camera,
  CheckCircle2,
  ArrowLeft,
  User,
  Briefcase,
  Mail,
  ShieldCheck,
  Save,
  Loader2,
  Upload,
  Phone,
  FileBadge,
  Sparkles,
} from 'lucide-react';

interface ProfileScreenProps {
  user: AuthUser;
  cargo: CargoRole;
  onBack: () => void;
  onUpdateUser: (updated: Partial<AuthUser>) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  cargo,
  onBack,
  onUpdateUser,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [email, setEmail] = useState(user.email || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [userRole, setUserRole] = useState((user.activeRole || cargo) as string);
  const [phone, setPhone] = useState(user.phone || '+51 984 123 456');
  const [cipDni, setCipDni] = useState(user.cipDni || 'DNI / CIP 204918');
  const [specialty, setSpecialty] = useState(user.specialty || 'Ingeniería Geotécnica y Exploraciones');

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPhotoURL(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) {
      setNotification('Por favor complete su nombre y correo.');
      return;
    }

    setIsSaving(true);
    setNotification(null);

    const updatedProfile = {
      uid: user.uid,
      originalEmail: user.email,
      email: email.trim().toLowerCase(),
      displayName: displayName.trim(),
      photoURL,
      authorizedRole: userRole,
      phone: phone.trim(),
      cipDni: cipDni.trim(),
      specialty: specialty.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Save to backend database endpoint
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });

      if (!res.ok) throw new Error('Error al actualizar el perfil');

      // 2. Update local state
      onUpdateUser({
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        photoURL,
        phone: phone.trim(),
        cipDni: cipDni.trim(),
        specialty: specialty.trim(),
      });

      // 3. Cache in localStorage for client persistence
      localStorage.setItem(`geo_profile_${user.uid}`, JSON.stringify(updatedProfile));
      localStorage.setItem(`geo_profile_${email.trim().toLowerCase()}`, JSON.stringify(updatedProfile));

      setNotification('¡Perfil y credenciales actualizados exitosamente en la base de datos!');
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      // Fallback update in state and localStorage
      onUpdateUser({
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        photoURL,
        phone: phone.trim(),
        cipDni: cipDni.trim(),
        specialty: specialty.trim(),
      });
      localStorage.setItem(`geo_profile_${user.uid}`, JSON.stringify(updatedProfile));
      setNotification('¡Perfil guardado localmente con éxito!');
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          <span className="font-extrabold text-base tracking-tight text-stone-900">
            PERFIL DEL USUARIO • GEOCIENCES S.A.C.
          </span>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 max-w-xl w-full mx-auto p-6 sm:p-8 flex flex-col items-center justify-center">
        <form onSubmit={handleSaveChanges} className="w-full space-y-6 text-center">
          {/* FOTO DE PERFIL */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-stone-200 shadow-xl overflow-hidden bg-stone-100 flex items-center justify-center">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white text-3xl font-black uppercase">
                    {displayName.substring(0, 2) || 'GS'}
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-stone-900 hover:bg-black text-white shadow-md transition-transform group-hover:scale-105 cursor-pointer"
                title="Tomar fotografía o elegir de la galería"
              >
                <Camera className="w-5 h-5 text-red-500" />
              </button>
            </div>

            {/* BOTÓN EDITAR FOTO */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold tracking-wide transition-colors border border-stone-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-stone-600" />
              <span>EDITAR FOTO</span>
            </button>
            <span className="text-[11px] text-stone-400">
              Tome una foto con su cámara o seleccione de la galería del celular
            </span>
          </div>

          {/* Form Fields: Editable Nombres y Correo por cualquier usuario */}
          <div className="space-y-4 text-left max-w-md mx-auto w-full">
            {/* NOMBRE */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Nombre Completo del Usuario
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="Ej. Ing. Danilo Acosta Samaniego"
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 font-medium"
                />
                <User className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* CORREO (EDITABLE) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Correo Electrónico del Usuario
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ejemplo@geosciences.pe"
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 font-medium font-mono"
                />
                <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* CARGO */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Cargo / Rol Operativo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  placeholder="GERENTE / ADMINISTRADOR / RESIDENTE / OBRERO"
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 font-medium uppercase"
                />
                <Briefcase className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* TELÉFONO / WHATSAPP */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Teléfono / WhatsApp de Contacto
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+51 984 123 456"
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 font-medium font-mono"
                />
                <Phone className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* DNI / CIP */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Documento de Identidad / Colegiatura CIP
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cipDni}
                  onChange={(e) => setCipDni(e.target.value)}
                  placeholder="DNI 70491822 / CIP 198201"
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 font-medium uppercase font-mono"
                />
                <FileBadge className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* ESPECIALIDAD */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Especialidad Técnica
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Perforación Diamantina, Geotecnia, Geofísica..."
                  className="w-full px-4 py-3 pl-11 rounded-xl text-sm border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 font-medium"
                />
                <Sparkles className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Confirmation Notification */}
          {notification && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 max-w-md mx-auto animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* BOTÓN VERDE ANCHO: GUARDAR CAMBIOS */}
          <div className="pt-2 max-w-md mx-auto w-full">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer uppercase"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>GUARDANDO EN SU PERFIL...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>GUARDAR CAMBIOS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50 py-3 px-6 text-center text-xs text-stone-500">
        <p>GEOCIENCES S.A.C. • Perfil y Credenciales de Identidad en la Nube</p>
      </footer>
    </div>
  );
};
