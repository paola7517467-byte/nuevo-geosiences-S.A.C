import React, { useState, useEffect, useRef } from 'react';
import { CargoRole, AuthUser, CargoItemRecord } from '../types';
import { generateCargoItemPdf } from '../utils/pdfGenerator';
import {
  Menu,
  Home,
  FileSpreadsheet,
  Crosshair,
  MessageCircle,
  Download,
  Upload,
  Edit2,
  Check,
  X,
  ExternalLink,
  Plus,
  Loader2,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Paperclip,
  MapPin,
} from 'lucide-react';

interface UnifiedCargoPanelProps {
  cargo: CargoRole;
  user: AuthUser;
  onOpenSidebar: () => void;
  onGoHome: () => void;
  onOpenExcel: () => void;
  onOpenGps: () => void;
}

export const UnifiedCargoPanel: React.FC<UnifiedCargoPanelProps> = ({
  cargo,
  user,
  onOpenSidebar,
  onGoHome,
  onOpenExcel,
  onOpenGps,
}) => {
  const [items, setItems] = useState<CargoItemRecord[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Editable fields in edit mode
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVO' | 'EN_CURSO' | 'COMPLETADO' | 'PENDIENTE'>('ACTIVO');
  const [editLat, setEditLat] = useState<number>(-14.12);
  const [editLng, setEditLng] = useState<number>(-72.54);

  // New item modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSubtitle, setNewItemSubtitle] = useState('');
  const [newItemNotes, setNewItemNotes] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [syncStatusText, setSyncStatusText] = useState('Sincronizado con Google Drive');

  // File upload input ref for "INSERTAR PDF"
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Drive folder links according to prompt
  const driveLinks: Record<CargoRole, string> = {
    GERENTE: 'https://drive.google.com/drive/folders/12vwQupCEab9IW8GfBjGtt8IYULnNFHe5?usp=drive_link',
    ADMINISTRADOR: 'https://drive.google.com/drive/folders/16HKzbRHthYxBbR0gc-ZPUP3c90ftx7dm?usp=sharing',
    RESIDENTE: 'https://drive.google.com/drive/folders/1SNQALKRa4MAWm4rZtu2LekQsMpu-LwoV?usp=sharing',
    OBRERO: 'https://drive.google.com/drive/folders/1HQRnfV-qfg9bzP2YoNtg6aWnG8_-xHK1?usp=sharing',
  };

  // WhatsApp links por cargo
  const whatsappLinks: Record<CargoRole, string> = {
    GERENTE: 'https://chat.whatsapp.com/IfDos243VUP8xzd0Tv6u7T?s=cl&p=a&iam=2',
    ADMINISTRADOR: 'https://chat.whatsapp.com/JXqOdyL9r7vE6eUBaKEeUR',
    RESIDENTE: 'https://chat.whatsapp.com/B6O1kChOjqdHmbj2c0ubMN',
    OBRERO: 'https://chat.whatsapp.com/FRSXmm8CgfI4o0YhGF00nt',
  };
  const whatsappLink = whatsappLinks[cargo];

  // Load items from backend on mount
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/items/${cargo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items) {
          // Ensure each item has default coordinates if missing
          const defaultCoords: Record<CargoRole, { lat: number; lng: number }> = {
            GERENTE: { lat: -14.1245, lng: -72.5412 }, // Las Bambas
            ADMINISTRADOR: { lat: -12.0864, lng: -77.0016 }, // Lima Central
            RESIDENTE: { lat: -9.5321, lng: -77.0543 }, // Antamina
            OBRERO: { lat: -14.1251, lng: -72.5422 }, // Frente Ferrobamba
          };

          const prepared = data.items.map((it: any) => ({
            ...it,
            locationCoordinates: it.locationCoordinates || defaultCoords[cargo],
          }));
          setItems(prepared);
        }
      })
      .catch((err) => console.error('Error fetching items:', err))
      .finally(() => setIsLoading(false));
  }, [cargo]);

  // Color & Theme Configurations per user prompt
  const getThemeConfig = () => {
    switch (cargo) {
      case 'GERENTE':
        return {
          bg: 'bg-black text-white',
          topBar: 'bg-zinc-950 border-zinc-800 text-white',
          bottomBar: 'bg-zinc-950 border-zinc-800 text-white',
          cardBg: 'bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700',
          indicator: 'bg-emerald-500 shadow-emerald-500/50',
          titleColor: 'text-white',
          subtitleColor: 'text-zinc-400',
          btnPrimary: 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700',
          btnDrive: 'bg-white hover:bg-zinc-100 text-black font-extrabold',
          sectionTitle: 'LISTA DE PROYECTOS MINEROS Y GEOTÉCNICOS',
          subtitleBadge: 'Panel del Gerente',
          btnPdfInsert: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700',
        };
      case 'ADMINISTRADOR':
        return {
          bg: 'bg-zinc-700 text-white',
          topBar: 'bg-zinc-800 border-zinc-600 text-white',
          bottomBar: 'bg-zinc-800 border-zinc-600 text-white',
          cardBg: 'bg-zinc-800/95 border-zinc-600 text-white hover:border-zinc-500 shadow-md',
          indicator: 'bg-blue-400 shadow-blue-400/50',
          titleColor: 'text-white',
          subtitleColor: 'text-zinc-300',
          btnPrimary: 'bg-zinc-900 hover:bg-black text-white border-zinc-700',
          btnDrive: 'bg-black hover:bg-zinc-900 text-white font-extrabold',
          sectionTitle: 'PADRÓN Y REGISTROS DEL PERSONAL',
          subtitleBadge: 'Panel del Administrador',
          btnPdfInsert: 'bg-zinc-900 hover:bg-black text-white border-zinc-700',
        };
      case 'RESIDENTE':
        return {
          bg: 'bg-[#0f2438] text-white',
          topBar: 'bg-[#0c1e2e] border-sky-800 text-white',
          bottomBar: 'bg-[#0c1e2e] border-sky-800 text-white',
          cardBg: 'bg-[#132d47] border-sky-800 text-white hover:border-sky-700 shadow-md',
          indicator: 'bg-teal-400 shadow-teal-400/50',
          titleColor: 'text-white',
          subtitleColor: 'text-sky-300',
          btnPrimary: 'bg-sky-900 hover:bg-sky-800 text-white border-sky-700',
          btnDrive: 'bg-sky-500 hover:bg-sky-400 text-white font-extrabold',
          sectionTitle: 'SUPERVISIÓN DE PROYECTOS Y SONDAJES',
          subtitleBadge: 'Panel del Residente',
          btnPdfInsert: 'bg-sky-900/90 hover:bg-sky-800 text-sky-100 border-sky-700',
        };
      case 'OBRERO':
        return {
          bg: 'bg-[#e0f2fe] text-slate-900',
          topBar: 'bg-[#bae6fd] border-sky-300 text-slate-900',
          bottomBar: 'bg-[#bae6fd] border-sky-300 text-slate-900',
          cardBg: 'bg-white border-sky-200 text-slate-900 hover:border-sky-300 shadow-sm',
          indicator: 'bg-sky-500 shadow-sky-500/50',
          titleColor: 'text-slate-900',
          subtitleColor: 'text-slate-600',
          btnPrimary: 'bg-sky-100 hover:bg-sky-200 text-slate-900 border-sky-300',
          btnDrive: 'bg-sky-600 hover:bg-sky-700 text-white font-extrabold',
          sectionTitle: 'LISTA DE TRABAJOS Y ACTIVIDADES DE FRENTE',
          subtitleBadge: 'Panel del Obrero',
          btnPdfInsert: 'bg-sky-100 hover:bg-sky-200 text-slate-900 border-sky-300',
        };
    }
  };

  const theme = getThemeConfig();

  // Handle inline edit
  const handleStartEdit = (item: CargoItemRecord) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditSubtitle(item.subtitle || '');
    setEditNotes(item.notes || '');
    setEditStatus(item.status);
    if (item.locationCoordinates) {
      setEditLat(item.locationCoordinates.lat);
      setEditLng(item.locationCoordinates.lng);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;

    setSyncStatusText('Sincronizando con Drive...');
    try {
      const updatedFields = {
        title: editTitle.trim(),
        subtitle: editSubtitle.trim(),
        notes: editNotes.trim(),
        status: editStatus,
        locationCoordinates: { lat: editLat, lng: editLng },
      };

      const res = await fetch(`/api/items/${cargo}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) throw new Error('Error al guardar');

      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...updatedFields } : it))
      );
      setEditingItemId(null);
      setSyncStatusText('Cambios sincronizados en Google Drive');
      setTimeout(() => setSyncStatusText('Sincronizado con Google Drive'), 3000);
    } catch (err) {
      console.error('Error saving item:', err);
      setSyncStatusText('Error al sincronizar');
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  // Handle "INSERTAR PDF" (Upload/attach PDF file to the card)
  const handleInsertPdfClick = (itemId: string) => {
    fileInputRefs.current[itemId]?.click();
  };

  const handleFileChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const pdfDate = new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      // Update in state
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? {
                ...it,
                attachedPdfName: file.name,
                attachedPdfData: base64Data,
                attachedPdfDate: pdfDate,
              }
            : it
        )
      );

      // Sincronizar con backend
      fetch(`/api/items/${cargo}/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachedPdfName: file.name,
          attachedPdfData: base64Data,
          attachedPdfDate: pdfDate,
        }),
      }).catch((err) => console.warn('Could not sync attached PDF to server:', err));

      setSyncStatusText(`PDF "${file.name}" insertado y guardado`);
      setTimeout(() => setSyncStatusText('Sincronizado con Google Drive'), 4000);
    };

    reader.readAsDataURL(file);
  };

  // Download PDF (attached or generated)
  const handleDownloadPdf = (item: CargoItemRecord) => {
    if (item.attachedPdfData) {
      // Download the user's attached/inserted PDF
      const link = document.createElement('a');
      link.href = item.attachedPdfData;
      link.download = item.attachedPdfName || `GEOCIENCES_${item.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate official technical report PDF
      generateCargoItemPdf(item, cargo, user.displayName, user.email);
    }
  };

  // Add new item to the list
  const handleAddNewItem = () => {
    if (!newItemTitle.trim()) return;

    const newId = `${cargo.toLowerCase()}-${Date.now()}`;
    const newItem: CargoItemRecord = {
      id: newId,
      title: newItemTitle.trim(),
      subtitle: newItemSubtitle.trim() || 'Nuevo Registro de Campo',
      notes: newItemNotes.trim() || undefined,
      status: 'ACTIVO',
      code: `REG-${Math.floor(100 + Math.random() * 900)}`,
      locationCoordinates: { lat: -14.1245, lng: -72.5412, label: newItemTitle.trim() },
      updatedAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setIsAddModalOpen(false);
    setNewItemTitle('');
    setNewItemSubtitle('');
    setNewItemNotes('');

    // Sync to backend
    fetch(`/api/items/${cargo}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch((err) => console.warn('Could not add item to server:', err));
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col justify-between selection:bg-red-600 selection:text-white transition-colors duration-200`}>
      {/* 1. BARRA SUPERIOR FIJA:
          - Menú hamburguesa a la izquierda.
          - Nombre GEOCIENCES S.A.C. centrado.
          - Botón de inicio (casa) a la derecha.
      */}
      <header className={`sticky top-0 z-30 px-4 sm:px-6 py-3 border-b ${theme.topBar} shadow-md backdrop-blur-md`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Menú hamburguesa a la izquierda */}
          <button
            onClick={onOpenSidebar}
            aria-label="Abrir menú lateral"
            className="p-2 rounded-xl hover:bg-black/15 transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
            title="Menú"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Nombre GEOCIENCES S.A.C. centrado */}
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-black tracking-wider uppercase leading-none">
              GEOCIENCES <span className="text-red-500">S.A.C.</span>
            </h1>
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-80">
              {theme.subtitleBadge}
            </span>
          </div>

          {/* Botón de inicio (casa) a la derecha */}
          <button
            onClick={onGoHome}
            aria-label="Ir al inicio"
            className="p-2 rounded-xl hover:bg-black/15 transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
            title="Inicio / Selección de Cargo"
          >
            <Home className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* 2. LISTA CENTRAL DE PROYECTOS, TRABAJADORES O ACTIVIDADES */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header of central list with "+ AGREGAR REGISTRO" and "ABRIR GOOGLE MAPS" buttons */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3 border-current/20">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
              {theme.sectionTitle}
            </h2>
            <p className="text-xs opacity-75 font-mono">
              Carpeta Google Drive • {syncStatusText}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Record button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              title="Insertar más registros"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <span className="text-xs font-mono font-bold tracking-wider">
              Conectando con Google Drive...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isExpanded = expandedItemId === item.id;
              const coords = item.locationCoordinates || { lat: -14.1245, lng: -72.5412 };

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border ${theme.cardBg} transition-all duration-200 overflow-hidden`}
                >
                  {/* Hidden File Input for "INSERTAR PDF" */}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[item.id] = el;
                    }}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => handleFileChange(item.id, e)}
                    className="hidden"
                  />

                  {/* Top summary row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Indicador + Nombre */}
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* Punto Indicador */}
                      <span
                        className={`w-3.5 h-3.5 rounded-full shrink-0 mt-1 sm:mt-0 ${theme.indicator} animate-pulse`}
                      />

                      {/* Nombre editable o visualización */}
                      <div className="flex-1 min-w-0">
                        {editingItemId === item.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Título del registro"
                              className="w-full px-3 py-1.5 rounded-lg text-sm bg-stone-100 text-stone-900 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                            />
                            <input
                              type="text"
                              value={editSubtitle}
                              onChange={(e) => setEditSubtitle(e.target.value)}
                              placeholder="Subtítulo / Frente / Detalle"
                              className="w-full px-3 py-1.5 rounded-lg text-xs bg-stone-100 text-stone-900 border border-stone-300 focus:outline-none"
                            />
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              rows={2}
                              placeholder="Insertar más información técnica, notas de obra..."
                              className="w-full px-3 py-1.5 rounded-lg text-xs bg-stone-100 text-stone-900 border border-stone-300 focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Guardar</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 rounded-lg bg-stone-300 text-stone-800 hover:bg-stone-400 text-xs font-bold"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-sm sm:text-base ${theme.titleColor} truncate`}>
                                {item.title}
                              </span>
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1 text-current/60 hover:text-current rounded transition-colors cursor-pointer"
                                title="Editar información"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {item.subtitle && (
                              <p className={`text-xs ${theme.subtitleColor} mt-0.5 truncate`}>
                                {item.subtitle}
                              </p>
                            )}
                            {item.code && (
                              <span className="text-[10px] font-mono opacity-60 uppercase mr-2">
                                Cód: {item.code}
                              </span>
                            )}
                            {item.attachedPdfName && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                                <Paperclip className="w-3 h-3 text-emerald-400" />
                                <span>{item.attachedPdfName}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BOTONES PRINCIPALES DE ACCIÓN:
                        1. INSERTAR PDF
                        2. BOTÓN ROJO: DESCARGAR PDF
                        3. VER MÁS DETALLES
                    */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                      {/* Botón INSERTAR PDF (Ubicado justo al lado del botón rojo de descarga) */}
                      <button
                        onClick={() => handleInsertPdfClick(item.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] ${theme.btnPdfInsert}`}
                        title="Insertar y adjuntar archivo PDF a este recuadro"
                      >
                        <Upload className="w-3.5 h-3.5 text-red-500" />
                        <span>Insertar PDF</span>
                      </button>

                      {/* Botón Rojo OBLIGATORIO: DESCARGAR PDF */}
                      <button
                        onClick={() => handleDownloadPdf(item)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                        title="Descargar reporte PDF oficial"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar PDF</span>
                      </button>

                      {/* Botón Desplegar más información */}
                      <button
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="p-2 rounded-xl bg-black/10 hover:bg-black/20 text-current transition-colors"
                        title={isExpanded ? 'Ocultar información' : 'Ver más información técnica'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Technical Details Drawer ("Insertar más información") */}
                  {isExpanded && (
                    <div className="p-4 bg-black/10 border-t border-current/10 space-y-3 text-xs leading-relaxed animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-black/15 border border-current/10">
                          <span className="text-[10px] font-mono opacity-70 block uppercase">
                            Coordenadas Georreferenciadas
                          </span>
                          <strong className="font-mono text-sm block mt-0.5">
                            {coords.lat.toFixed(5)}°, {coords.lng.toFixed(5)}°
                          </strong>
                          <span className="text-[10px] opacity-60 block mt-1">
                            Punto geodésico registrado
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-black/15 border border-current/10">
                          <span className="text-[10px] font-mono opacity-70 block uppercase">
                            Archivo PDF Adjuntado
                          </span>
                          {item.attachedPdfName ? (
                            <div className="mt-1 space-y-1">
                              <span className="font-semibold text-emerald-400 block truncate">
                                {item.attachedPdfName}
                              </span>
                              <span className="text-[10px] opacity-60 block">
                                Subido el: {item.attachedPdfDate || 'Reciente'}
                              </span>
                              <button
                                onClick={() => handleDownloadPdf(item)}
                                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>Abrir / Descargar PDF</span>
                              </button>
                            </div>
                          ) : (
                            <div className="mt-1">
                              <span className="opacity-60 block">Sin PDF adjuntado</span>
                              <button
                                onClick={() => handleInsertPdfClick(item.id)}
                                className="mt-1 text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Insertar archivo PDF ahora</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-black/15 border border-current/10">
                          <span className="text-[10px] font-mono opacity-70 block uppercase">
                            Estado Operativo
                          </span>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-current/15 border border-current/20">
                            {item.status}
                          </span>
                          <span className="text-[10px] opacity-60 block mt-1 font-mono">
                            Última actualización: {item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString('es-PE') : 'Reciente'}
                          </span>
                        </div>
                      </div>

                      {/* Technical Notes / Description */}
                      <div className="p-3 rounded-xl bg-black/15 border border-current/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase opacity-80">
                            Notas de Campo e Información Técnica Adicional
                          </span>
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Modificar información</span>
                          </button>
                        </div>
                        <p className="opacity-80">
                          {item.notes ||
                            'Registro oficial de obra auditado conforme a los estándares de exploración geotécnica de GEOCIENCES S.A.C. Puede presionar "Modificar información" para agregar más datos específicos de metraje, cuadrilla o sondajes.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* BOTÓN AL FINAL: ABRIR DRIVE */}
        <div className="pt-4 text-center">
          <a
            href={driveLinks[cargo]}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer ${theme.btnDrive}`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>ABRIR DRIVE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <p className="text-[11px] opacity-70 mt-2 font-mono">
            Abre la carpeta original de archivos de Google Drive
          </p>
        </div>
      </main>

      {/* 3. BARRA INFERIOR FIJA CON ACCESOS RÁPIDOS */}
      <footer className={`sticky bottom-0 z-30 px-4 sm:px-6 py-2.5 border-t ${theme.bottomBar} shadow-lg backdrop-blur-md`}>
        {cargo === 'GERENTE' ? (
          /* Gerente: Solo EXCEL y WHATSAPP (Google Maps restringido a Administrador, Residente y Obreros) */
          <div className="max-w-xs mx-auto grid grid-cols-2 gap-3">
            {/* EXCEL */}
            <button
              onClick={onOpenExcel}
              className="py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-black/15 transition-all text-center cursor-pointer group"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-wider">EXCEL</span>
            </button>

            {/* WHATSAPP */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-black/15 transition-all text-center cursor-pointer group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-wider">WHATSAPP</span>
            </a>
          </div>
        ) : (
          /* Administrador, Residente y Obreros: EXCEL, GOOGLE MAPS (coordenadas en tiempo real) y WHATSAPP */
          <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
            {/* EXCEL */}
            <button
              onClick={onOpenExcel}
              className="py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-black/15 transition-all text-center cursor-pointer group"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-wider">EXCEL</span>
            </button>

            {/* GOOGLE MAPS - Coordenadas en tiempo real */}
            <button
              onClick={onOpenGps}
              className="py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-black/15 transition-all text-center cursor-pointer group relative"
              title="Google Maps: Coordenadas y Telemetría en Tiempo Real"
            >
              <span className="absolute top-1 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <MapPin className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-wider">GOOGLE MAPS</span>
            </button>

            {/* WHATSAPP */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-black/15 transition-all text-center cursor-pointer group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-wider">WHATSAPP</span>
            </a>
          </div>
        )}
      </footer>

      {/* Modal to Insert New Item / Box with information */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-stone-900">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 text-left">
            <div className="flex items-center justify-between border-b pb-3 border-stone-200">
              <h3 className="font-extrabold text-base text-stone-900">
                Insertar Nuevo Registro ({cargo})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Nombre del Proyecto / Trabajador / Tarea
                </label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Ej. Sondaje Diamantino Pozo DDH-24-10"
                  className="w-full px-3 py-2 border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Subtítulo / Frente / Cargo
                </label>
                <input
                  type="text"
                  value={newItemSubtitle}
                  onChange={(e) => setNewItemSubtitle(e.target.value)}
                  placeholder="Ej. Plataforma P-10 • Mina Antamina"
                  className="w-full px-3 py-2 border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Información Técnica y Notas
                </label>
                <textarea
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  rows={3}
                  placeholder="Insertar datos técnicos adicionales de avance, equipo, recuperación..."
                  className="w-full px-3 py-2 border rounded-xl border-stone-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddNewItem}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Guardar e Insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
