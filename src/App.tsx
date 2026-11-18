import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, setCachedAccessToken } from './lib/firebase';
import { CargoRole, AuthUser } from './types';
import { LoginScreen } from './components/LoginScreen';
import { CargoSelectionScreen } from './components/CargoSelectionScreen';
import { PasswordModal } from './components/PasswordModal';
import { UnifiedCargoPanel } from './components/UnifiedCargoPanel';
import { ExcelModule } from './components/ExcelModule';
import { GpsModule } from './components/GpsModule';
import { ProfileScreen } from './components/ProfileScreen';
import { SidebarMenu } from './components/SidebarMenu';
import { RoleModal } from './components/RoleModal';
import { ProtocolsModal } from './components/ProtocolsModal';

type AppSubView = 'PANEL' | 'EXCEL' | 'GPS' | 'PROFILE';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeCargo, setActiveCargo] = useState<CargoRole | null>(null);
  const [pendingCargo, setPendingCargo] = useState<CargoRole | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Subview inside active cargo
  const [currentView, setCurrentView] = useState<AppSubView>('PANEL');

  // Modals for Sidebar Menu
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isProtocolsModalOpen, setIsProtocolsModalOpen] = useState(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  // Listen for Google Maps Platform quota exhaustion
  useEffect(() => {
    const onQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  // Safely prevent Gerente from staying on GPS view
  useEffect(() => {
    if (activeCargo === 'GERENTE' && currentView === 'GPS') {
      setCurrentView('PANEL');
    }
  }, [activeCargo, currentView]);

  // Check initial session from backend and Firebase on boot
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          // Verify with backend
          const res = await fetch('/api/auth/verify-google-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              uid: firebaseUser.uid,
            }),
          });

          const data = await res.json();

          if (res.ok && data.authorized) {
            // Check if user has saved custom profile in database
            let userProfile = {
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL || undefined,
            };

            try {
              const profRes = await fetch(`/api/profile/${firebaseUser.email}`);
              const profData = await profRes.json();
              if (profData?.profile) {
                userProfile.displayName = profData.profile.displayName || userProfile.displayName;
                userProfile.photoURL = profData.profile.photoURL || userProfile.photoURL;
              }
            } catch {
              // ignore
            }

            // Check if there's also an active role session verified
            const sessionRes = await fetch('/api/auth/session');
            const sessionData = await sessionRes.json();

            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email.toLowerCase(),
              displayName: userProfile.displayName,
              photoURL: userProfile.photoURL,
              isAuthorized: true,
              activeRole: sessionData.authenticated ? (sessionData.activeRole as CargoRole) : null,
              authProvider: 'google',
            });

            if (sessionData.authenticated && sessionData.activeRole) {
              setActiveCargo(sessionData.activeRole as CargoRole);
            }
          } else {
            await signOut(auth);
            setCurrentUser(null);
            setActiveCargo(null);
          }
        } catch (err) {
          console.error('Session verification error:', err);
        }
      } else {
        // Check if there is a corporate session cookie
        try {
          const sessionRes = await fetch('/api/auth/session');
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.email) {
            setCurrentUser({
              uid: `corp-${sessionData.email}`,
              email: sessionData.email,
              displayName: sessionData.email.split('@')[0],
              isAuthorized: true,
              activeRole: sessionData.activeRole as CargoRole,
              authProvider: 'corporate',
            });
            if (sessionData.activeRole) {
              setActiveCargo(sessionData.activeRole as CargoRole);
            }
          }
        } catch {
          // ignore
        }
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setActiveCargo(null);
    setCurrentView('PANEL');
  };

  const handleSelectCargo = (role: CargoRole) => {
    setPendingCargo(role);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSuccess = (role: CargoRole) => {
    setActiveCargo(role);
    setIsPasswordModalOpen(false);
    setPendingCargo(null);
    setCurrentView('PANEL');
  };

  const handleGoHome = () => {
    setActiveCargo(null);
    setCurrentView('PANEL');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCachedAccessToken(null);
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setActiveCargo(null);
    setPendingCargo(null);
    setIsPasswordModalOpen(false);
    setCurrentView('PANEL');
  };

  const handleSidebarOption = (option: 'HOME' | 'INFORMES' | 'ROL' | 'PROTOCOLOS' | 'PERFIL') => {
    switch (option) {
      case 'HOME':
        setCurrentView('PANEL');
        break;
      case 'INFORMES':
        setCurrentView('EXCEL');
        break;
      case 'ROL':
        setIsRoleModalOpen(true);
        break;
      case 'PROTOCOLOS':
        setIsProtocolsModalOpen(true);
        break;
      case 'PERFIL':
        setCurrentView('PROFILE');
        break;
    }
  };

  const handleUpdateProfile = (updated: Partial<AuthUser>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updated });
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#120822] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-purple-200 tracking-wider uppercase font-mono">
            GEOCIENCES S.A.C. • Conectando con Google y base de datos...
          </span>
        </div>
      </div>
    );
  }

  // 1. First Screen: Neutral Background with "CONECTAR CON GOOGLE" button with red border
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Second Screen: Pitch Black Background with "SELECCIONAR CARGO" title and 4 large buttons
  if (!activeCargo) {
    return (
      <>
        <CargoSelectionScreen
          user={currentUser}
          onSelectCargo={handleSelectCargo}
          onLogout={handleLogout}
        />

        {/* Password Modal with dark background, central white card, eye toggle, and backend validation */}
        {pendingCargo && (
          <PasswordModal
            role={pendingCargo}
            userEmail={currentUser.email}
            isOpen={isPasswordModalOpen}
            onClose={() => {
              setIsPasswordModalOpen(false);
              setPendingCargo(null);
            }}
            onSuccess={handlePasswordSuccess}
          />
        )}
      </>
    );
  }

  // 3. Subviews inside Cargo:
  // EXCEL & REPORTS VIEW
  if (currentView === 'EXCEL') {
    return (
      <ExcelModule
        cargo={activeCargo}
        user={currentUser}
        onBack={() => setCurrentView('PANEL')}
      />
    );
  }

  // GOOGLE MAPS & REAL-TIME COORDINATES VIEW (Exclusively for ADMINISTRADOR, RESIDENTE, and OBRERO)
  if (currentView === 'GPS' && activeCargo !== 'GERENTE') {
    return (
      <>
        {gmpQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}
        <GpsModule
          cargo={activeCargo}
          user={currentUser}
          onBack={() => setCurrentView('PANEL')}
        />
      </>
    );
  }

  // USER PROFILE VIEW
  if (currentView === 'PROFILE') {
    return (
      <ProfileScreen
        user={currentUser}
        cargo={activeCargo}
        onBack={() => setCurrentView('PANEL')}
        onUpdateUser={handleUpdateProfile}
      />
    );
  }

  // MAIN CARGO PANEL VIEW (UnifiedCargoPanel with fixed header, central list, bottom bar)
  return (
    <>
      <UnifiedCargoPanel
        cargo={activeCargo}
        user={currentUser}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onGoHome={handleGoHome}
        onOpenExcel={() => setCurrentView('EXCEL')}
        onOpenGps={() => setCurrentView('GPS')}
      />

      {/* Sidebar Sliding Dark Menu */}
      <SidebarMenu
        isOpen={isSidebarOpen}
        cargo={activeCargo}
        user={currentUser}
        onClose={() => setIsSidebarOpen(false)}
        onSelectOption={handleSidebarOption}
      />

      {/* Role Responsibilities Modal */}
      <RoleModal
        cargo={activeCargo}
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Institutional Safety Protocols Modal */}
      <ProtocolsModal
        cargo={activeCargo}
        isOpen={isProtocolsModalOpen}
        onClose={() => setIsProtocolsModalOpen(false)}
      />
    </>
  );
}
