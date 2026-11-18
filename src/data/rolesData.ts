export interface RoleDetail {
  title: string;
  scope: string;
  hierarchy: string;
  responsibilities: string[];
  keyObjectives: string[];
}

export const INITIAL_ROLES_DATA: Record<string, RoleDetail> = {
  GERENTE: {
    title: 'CARGO: GERENTE GENERAL Y DIRECTIVO EJECUTIVO',
    scope: 'Gobernanza integral, representación legal, dirección financiera y estratégica de GEOCIENCES S.A.C.',
    hierarchy: 'Máxima instancia ejecutiva del Directorio.',
    responsibilities: [
      'Representar legal y comercialmente a GEOCIENCES S.A.C. ante clientes mineros, entidades bancarias e instituciones del Estado.',
      'Aprobar los presupuestos de inversión en exploración geológica, adquisición de maquinaria pesada y contratos de gran envergadura.',
      'Supervisar los estados financieros mensuales, balances de obras y márgenes de utilidad operativa por unidad de negocio.',
      'Establecer la política de Cero Accidentes y asegurar la provisión de recursos intangibles para seguridad SSOMA.',
      'Liderar auditorías directivas, resolver contingencias contractuales y autorizar convenios de asociación estratégica.',
      'Aprobar nombramientos de superintendentes, jefes de departamento y residentes colegiados.',
    ],
    keyObjectives: [
      'Alcanzar un índice de accidentabilidad TRIFR de 0.00 en todas las operaciones.',
      'Mantener un margen operativo superior al 22% anual en consultoría geotécnica y perforación.',
      'Cumplir el 100% de los hitos contractuales acordados con empresas mineras de primer nivel.',
    ],
  },
  ADMINISTRADOR: {
    title: 'CARGO: ADMINISTRADOR DE OPERACIONES Y RECURSOS',
    scope: 'Gestión de personal, homologación documentaria, logística de compras y parque de maquinaria pesada.',
    hierarchy: 'Reporta directamente a la Gerencia General.',
    responsibilities: [
      'Gestionar las planillas de sueldos, seguros de riesgo (SCTR Salud y Pensión) y beneficios del personal de obra y administrativo.',
      'Administrar el padrón de cuentas autorizadas y perfiles de acceso institucional para GEOCIENCES S.A.C.',
      'Supervisar el mantenimiento mecánico programado, pólizas de seguros e inspecciones técnicas de la flota de sondas y camionetas 4x4.',
      'Gestionar las órdenes de compra de insumos de perforación (bentonita, polímeros, coronas diamantadas y tuberías HQ/NQ).',
      'Asegurar el cumplimiento de normativas de Defensa Civil (INDECI) en sedes centrales y almacenes generales.',
      'Auditar los expedientes de homologación de contratistas y proveedores antes de su movilización a mina.',
    ],
    keyObjectives: [
      'Garantizar el 100% del personal en campo con exámenes médicos ocupacionales y SCTR vigentes.',
      'Optimizar los tiempos de abastecimiento de repuestos críticos a menos de 48 horas en campamento.',
      'Mantener la disponibilidad mecánica del parque de perforación por encima del 92%.',
    ],
  },
  RESIDENTE: {
    title: 'CARGO: INGENIERO RESIDENTE DE OBRA',
    scope: 'Dirección técnica en campo, control de sondajes diamantinos, ensayos geotécnicos y cuaderno digital de obra.',
    hierarchy: 'Jefatura técnica en terreno; coordina con la supervisión del cliente minero.',
    responsibilities: [
      'Liderar la ejecución técnica de las campañas de perforación diamantina según normas ASTM D2113 y D1586.',
      'Emitir y autorizar diariamente los Permisos Escritos de Trabajo de Alto Riesgo (PETAR) y análisis de trabajo seguro (ATS).',
      'Asentar diariamente en el cuaderno digital de obra el metraje perforado, recuperación de testigos RQD y condiciones del terreno.',
      'Supervisar la correcta ejecución de ensayos geotécnicos in situ (SPT, Lugeon, Lefranc, presiometría y toma de muestras Shelby).',
      'Monitorear la estabilidad de taludes y evaluar riesgos geodinámicos en las plataformas de perforación.',
      'Coordinar el relevo de guardias y la logística diaria de agua, combustible y aditivos para la sonda.',
    ],
    keyObjectives: [
      'Cumplir los metros lineales de perforación programados con recuperaciones de testigo mayores al 95%.',
      'Cero incidentes de alto potencial o paralizaciones no planificadas en frente de trabajo.',
      'Entregar reportes litológicos y geomecánicos diarios validados dentro de las primeras 2 horas post-guardia.',
    ],
  },
  OBRERO: {
    title: 'CARGO: OPERADOR DE PERFORACIÓN, MUESTRERO Y AYUDANTE',
    scope: 'Ejecución operativa en plataforma, manipulación de varillaje, control de lodos y seguridad diaria en frente.',
    hierarchy: 'Reporta al Perforista Titular y al Ingeniero Residente de Obra.',
    responsibilities: [
      'Operar las palancas hidráulicas y controles mecánicos de la sonda diamantina bajo parámetros óptimos de RPM y presión.',
      'Acoplar y desacoplar varillaje de perforación HQ/NQ utilizando llaves y procedimientos de bloqueo de línea de fuego.',
      'Recuperar los tubos interiores (core barrel), extraer los testigos de roca con cuidado y colocarlos ordenadamente en las cajas.',
      'Inspeccionar y utilizar obligatoriamente todo el equipo de protección personal (EPP) completo al inicio y durante el turno.',
      'Preparar y dosificar los lodos de perforación (bentonita y polímeros biodegradables) manteniendo la viscosidad requerida.',
      'Ejercer el derecho de detención de trabajo (Política de Trabajo Inseguro) ante cualquier peligro inminente no controlado.',
    ],
    keyObjectives: [
      'Cero lesiones por atrapamiento de manos o contacto con piezas giratorias.',
      'Preservar la integridad física de los testigos de roca extraídos para el logueo geotécnico.',
      'Mantener el orden y limpieza (metodología 5S) permanente en la plataforma y fosa de fluidos.',
    ],
  },
};
