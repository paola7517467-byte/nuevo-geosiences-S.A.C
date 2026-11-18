import React, { useState, useEffect } from 'react';
import { CargoRole, SheetRowData, AuthUser } from '../types';
import { SHEETS_CONFIG } from '../data/sheetsConfig';
import {
  FileSpreadsheet,
  Plus,
  ExternalLink,
  Check,
  RefreshCw,
  AlertCircle,
  Download,
  ArrowLeft,
  CloudCheck,
  Save,
} from 'lucide-react';

interface ExcelModuleProps {
  cargo: CargoRole;
  user: AuthUser;
  onBack: () => void;
}

export const ExcelModule: React.FC<ExcelModuleProps> = ({ cargo, user, onBack }) => {
  const config = SHEETS_CONFIG[cargo];
  const [rows, setRows] = useState<SheetRowData[]>(config.initialRows);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Sincronizado');
  const [activeCell, setActiveCell] = useState<{ rowId: string; colKey: string } | null>(null);

  // Load latest shared sheet data from backend on mount
  useEffect(() => {
    fetch(`/api/sheets/${cargo}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rows && data.rows.length > 0) {
          setRows(data.rows);
        }
      })
      .catch((err) => console.warn('Could not fetch server sheet, using local state:', err));
  }, [cargo]);

  // Handle cell edit and trigger auto-save with debounce
  const handleCellChange = (rowId: string, colKey: string, value: string) => {
    setRows((prevRows) => {
      const updated = prevRows.map((r) => (r.id === rowId ? { ...r, [colKey]: value } : r));
      saveToServer(updated);
      return updated;
    });
  };

  const saveToServer = async (dataToSave: SheetRowData[]) => {
    setSyncStatus('saving');
    try {
      const res = await fetch(`/api/sheets/${cargo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: dataToSave,
          cargo,
          updatedBy: user.email,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Error al sincronizar datos');

      setSyncStatus('synced');
      setLastSavedTime(
        `Guardado ${new Date().toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}`
      );
    } catch (err) {
      console.error('Error saving sheet to server:', err);
      setSyncStatus('error');
    }
  };

  // Add new row: "AUMENTAR CELDAS"
  const handleAddRow = () => {
    const newId = `${cargo.toLowerCase()}-${Date.now()}`;
    const newRow: SheetRowData = { id: newId };
    config.columns.forEach((col) => {
      newRow[col.key] = '';
    });

    const updated = [...rows, newRow];
    setRows(updated);
    saveToServer(updated);
  };

  // Export current table as CSV
  const handleExportCsv = () => {
    const headers = config.columns.map((c) => `"${c.label}"`).join(',');
    const csvRows = rows.map((r) =>
      config.columns.map((c) => `"${(r[c.key] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GEOCIENCES_${cargo}_HojaCalculo.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Volver al panel"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-stone-900 tracking-tight">
                  MÓDULO EXCEL & INFORMES
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {cargo}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">{config.title}</p>
            </div>
          </div>

          {/* Sync Status Badge & Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-50 border border-stone-200 text-stone-600">
              {syncStatus === 'synced' && (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-800 font-semibold">{lastSavedTime}</span>
                </>
              )}
              {syncStatus === 'saving' && (
                <>
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-blue-700">Guardando en nube...</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700">Error de sincronización</span>
                </>
              )}
            </div>

            <button
              onClick={handleExportCsv}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Exportar CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <a
              href={config.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">ABRIR EN DRIVE</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Table Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {/* Helper Banner */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>
              <strong>Celdas Editables:</strong> Haga clic en cualquier celda para modificarla
              directamente. Las celdas editables tienen un fondo amarillo tenue y guardan
              automáticamente los cambios.
            </span>
          </div>
          <span className="font-mono text-[11px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
            Total filas: {rows.length}
          </span>
        </div>

        {/* Interactive Spreadsheet Grid */}
        <div className="bg-white rounded-2xl shadow-md border border-stone-300 overflow-hidden">
          <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              {/* Header */}
              <thead className="bg-stone-900 text-white sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="py-3 px-3 w-12 text-center font-mono font-bold text-stone-400 border-r border-stone-800">
                    #
                  </th>
                  {config.columns.map((col) => (
                    <th
                      key={col.key}
                      style={{ minWidth: col.width || '150px' }}
                      className="py-3 px-3.5 font-bold uppercase tracking-wider text-xs border-r border-stone-800 last:border-r-0"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows */}
              <tbody className="divide-y divide-stone-200">
                {rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-stone-400 bg-stone-50 border-r border-stone-200 select-none">
                      {index + 1}
                    </td>

                    {config.columns.map((col) => {
                      const isFocused =
                        activeCell?.rowId === row.id && activeCell?.colKey === col.key;
                      return (
                        <td
                          key={col.key}
                          className={`p-0 border-r border-stone-200 last:border-r-0 bg-yellow-50/40 hover:bg-yellow-100/60 transition-colors ${
                            isFocused ? 'ring-2 ring-emerald-600 ring-inset bg-yellow-100/80' : ''
                          }`}
                        >
                          <input
                            type="text"
                            value={row[col.key] || ''}
                            onChange={(e) => handleCellChange(row.id, col.key, e.target.value)}
                            onFocus={() => setActiveCell({ rowId: row.id, colKey: col.key })}
                            onBlur={() => setActiveCell(null)}
                            placeholder={col.placeholder || 'Escriba aquí...'}
                            className="w-full h-full py-2.5 px-3 bg-transparent text-xs text-stone-900 focus:outline-none font-medium"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer with AUMENTAR CELDAS button */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={handleAddRow}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide flex items-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>AUMENTAR CELDAS</span>
            </button>

            <span className="text-xs text-stone-500 font-medium">
              Los cambios se sincronizan en tiempo real para todos los usuarios autorizados de{' '}
              <strong>GEOCIENCES S.A.C.</strong>
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-3 px-6 text-center text-xs text-stone-500">
        <p>Módulo de Hojas de Cálculo Interactivas • Sincronización Google Workspace & Drive</p>
      </footer>
    </div>
  );
};
