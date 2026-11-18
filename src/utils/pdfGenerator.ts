import { jsPDF } from 'jspdf';
import { CargoRole, CargoItemRecord } from '../types';

export function generateCargoItemPdf(
  item: CargoItemRecord,
  cargo: CargoRole,
  userName: string,
  userEmail: string
) {
  const doc = new jsPDF();

  // Primary banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  // Red accent line
  doc.setFillColor(220, 38, 38); // red-600
  doc.rect(0, 36, 210, 3, 'F');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('GEOCIENCES S.A.C.', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('CONSULTORÍA GEOLÓGICA, GEOTÉCNICA & EXPLORACIONES MINERAS', 14, 25);
  doc.text('RUC: 20601892811 • SISTEMA CORPORATIVO DE CONTROL DE OBRA', 14, 30);

  // Document metadata box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 46, 182, 38, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFICACIÓN Y FICHA TÉCNICA DE REGISTRO', 18, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Identificador de Registro: ${item.id}`, 18, 62);
  doc.text(`Cargo Emisor: ${cargo}`, 18, 68);
  doc.text(`Generado por: ${userName} (${userEmail})`, 18, 74);

  const now = new Date();
  doc.text(`Fecha y Hora: ${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE')}`, 110, 62);
  doc.text(`Estado Operativo: ${item.status}`, 110, 68);
  doc.text(`Sincronización: Nube Google Drive & Sheets`, 110, 74);

  // Main Item Detail Card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 92, 182, 70, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(220, 38, 38);
  doc.text(item.title.toUpperCase(), 18, 104);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  if (item.subtitle) {
    doc.text(`Descripción / Frente: ${item.subtitle}`, 18, 113);
  }
  if (item.code) {
    doc.text(`Código de Referencia: ${item.code}`, 18, 120);
  }

  doc.text('Especificaciones Técnicas y Parámetros:', 18, 129);
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  const specs = [
    '• Norma Técnica Aplicable: ASTM D2113 / NTP 339.134 (Perforación Diamantina y Geotecnia)',
    '• Control de Calidad: Certificado por el departamento de supervisión técnica de GEOCIENCES S.A.C.',
    '• Registro Digital: Vinculado a la carpeta oficial de Google Drive y registrado en servidor corporativo.',
    '• Inspección de Seguridad: Verificación de EPP, IPERC continuo y protocolo de trabajo en frente minero.',
  ];

  let yOffset = 136;
  specs.forEach((s) => {
    doc.text(s, 22, yOffset);
    yOffset += 6;
  });

  // Legal and compliance notes
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Nota de Confidencialidad: La información técnica contenida en este reporte es de propiedad exclusiva de GEOCIENCES S.A.C.',
    14,
    172
  );
  doc.text(
    'y sus clientes mineros autorizados. Queda terminantemente prohibida su reproducción sin autorización de Gerencia.',
    14,
    177
  );

  // Signature section
  doc.setDrawColor(148, 163, 184);
  doc.line(24, 230, 84, 230);
  doc.line(126, 230, 186, 230);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(userName.toUpperCase(), 54, 235, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`RESPONSABLE: ${cargo}`, 54, 240, { align: 'center' });
  doc.text('GEOCIENCES S.A.C.', 54, 244, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('GERENCIA GENERAL', 156, 235, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('DIRECCIÓN TÉCNICA & SSOMA', 156, 240, { align: 'center' });
  doc.text('SELLO DIGITAL VERIFICADO', 156, 244, { align: 'center' });

  // Footer bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('GEOCIENCES S.A.C. • Av. Javier Prado Este 4200, Santiago de Surco, Lima - Perú • www.geosciences.pe', 105, 292, {
    align: 'center',
  });

  // Save the PDF
  const cleanTitle = item.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  doc.save(`GEOCIENCES_${cargo}_${cleanTitle}.pdf`);
}
