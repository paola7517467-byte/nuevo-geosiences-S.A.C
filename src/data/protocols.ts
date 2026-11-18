export interface RoleProtocol {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  content: string[];
}

export const PROTOCOLS_DATA: Record<string, RoleProtocol> = {
  GERENTE: {
    title: 'POLÍTICA Y PROTOCOLO DE ALTA DIRECCIÓN EN SEGURIDAD, SALUD OCUPACIONAL Y MEDIO AMBIENTE (SSOMA)',
    subtitle: 'Marco de Gobernanza Corporativa, Responsabilidad Legal y Cero Accidentes • GEOCIENCES S.A.C.',
    version: 'P-DIR-001 Rev. 2026',
    lastUpdated: '10 de Noviembre de 2026',
    content: [
      `1. DECLARACIÓN DE PRINCIPIOS Y LIDERAZGO VISIBLE:
En GEOCIENCES S.A.C., la Alta Dirección asume como principio inquebrantable que ninguna meta de producción, perforación diamantina o rentabilidad financiera justifica exponer la vida o la salud de nuestros colaboradores, contratistas o comunidades aledañas. La Gerencia General lidera de manera activa, visible y medible la implementación de la Política de Seguridad y Salud en el Trabajo, garantizando la provisión ininterrumpida de los recursos financieros, humanos, técnicos y logísticos necesarios para mantener los estándares internacionales ISO 45001, ISO 14001 y el Reglamento de Seguridad y Salud Ocupacional en Minería (D.S. 024-2016-EM y sus modificatorias). El liderazgo visible implica que cada directivo debe predicar con el ejemplo durante sus inspecciones en terreno, portando el equipo de protección reglamentario y deteniendo inmediatamente cualquier operación donde se evidencie un riesgo crítico no controlado.

2. ASIGNACIÓN PRESUPUESTAL Y GESTIÓN DE RECURSOS:
La Gerencia aprueba anualmente una partida presupuestal autónoma e intangible destinada exclusivamente al Programa Anual de Seguridad y Salud Ocupacional (PASSO). Dicha partida abarca la renovación continua de maquinaria y sondas de perforación certificadas, la compra de Equipos de Protección Personal (EPP) de estándar internacional, la contratación de seguros complementarios de trabajo de riesgo (SCTR Salud y Pensión), programas de vigilancia médica ocupacional de alta resolución, mantenimiento preventivo de campamentos y unidades de transporte 4x4, y la capacitación continua de todo el personal en los centros mineros más exigentes del país. Bajo ninguna circunstancia se admitirá un recorte presupuestal que comprometa las salvaguardas operativas de las cuadrillas.

3. ESTRUCTURA DE RESPONSABILIDADES Y DELEGACIÓN AUTORIZADA:
La Gerencia General delega la autoridad operativa en el Residente de Obra y en el Ingeniero de Seguridad (Jefe SSOMA), otorgándoles potestad absoluta e irrefutable para ordenar la paralización preventiva de cualquier frente de perforación, calicata, trinchera o ensayo geofísico si las condiciones meteorológicas (tormentas eléctricas, deslizamientos de taludes o nevadas extremas) o fallas mecánicas así lo ameritan. La Alta Dirección prohíbe taxativamente cualquier represalia técnica, laboral o comercial frente a una paralización preventiva motivada por la protección de la vida humana.

4. CUMPLIMIENTO LEGAL, AUDITORÍAS Y DEBIDA DILIGENCIA:
Es responsabilidad indelegable del Gerente asegurar que GEOCIENCES S.A.C. cumpla con todas las disposiciones del Ministerio de Energía y Minas (MINEM), la Superintendencia Nacional de Fiscalización Laboral (SUNAFIL), el Organismo Supervisor de la Inversión en Energía y Minería (OSINERGMIN) y el Organismo de Evaluación y Fiscalización Ambiental (OEFA). Trimestralmente, la Gerencia convoca una auditoría interna rigurosa y recibe el informe del Comité de Seguridad y Salud en el Trabajo (CSST), evaluando los índices de frecuencia (IF), severidad (IS) y accidentabilidad (IA). Si ocurriese un evento con potencial de fatalidad o lesión grave, la Gerencia encabeza la comisión de investigación mediante metodología de análisis de causa raíz (como el Árbol de Causas o ICAM), implementando medidas correctivas y cerrando las no conformidades en un plazo máximo de 72 horas.

5. GESTIÓN ESTRATÉGICA DEL RIESGO Y LÍNEA DE BASE:
La Gerencia supervisa que la Matriz IPERC de Línea de Base (Identificación de Peligros, Evaluación de Riesgos y Medidas de Control) contemple todos los peligros inherentes a la consultoría geotécnica y perforación profunda: atrapamiento por varillaje en rotación, proyecciones de fluidos a alta presión, caída de rocas en taludes inestables, intoxicación por gases en labores subterráneas, riesgos biomecánicos por manipulación de cajas de testigos y fatiga por trabajo en altitudes superiores a los 4,500 m.s.n.m. Se exige la jerarquía estricta de controles: eliminación, sustitución, controles de ingeniería, controles administrativos y, en última instancia, EPP específico.

6. CULTURA DE TRANSPARENCIA Y REPORTE ABIERTO:
La Alta Dirección fomenta una cultura justa basada en el reporte oportuno de casi-accidentes (Near Misses) y condiciones subestándar. Los gerentes reconocen y premian públicamente a aquellos trabajadores y cuadrillas que demuestran una conducta proactiva en seguridad. Se prohíbe ocultar o minimizar incidentes bajo sanción de despido inmediato y denuncia civil según la legislación laboral peruana.

7. COMUNICACIÓN DE CRISIS Y CONTINUIDAD DEL NEGOCIO:
El Gerente General preside el Comité de Manejo de Crisis de GEOCIENCES S.A.C. En caso de una emergencia mayor, desastre natural o siniestro grave en campo, el Gerente es el único vocero autorizado frente a los clientes mineros, aseguradoras, autoridades gubernamentales y medios de comunicación. Este protocolo garantiza la debida atención médica inmediata, el traslado aero-médico si es requerido mediante convenios con clínicas de emergencias, y la asistencia integral y humana a las familias de nuestros trabajadores.

8. VIGENCIA Y REVISIÓN:
El presente protocolo rige con carácter obligatorio para todas las operaciones, oficinas centrales, laboratorios de mecánica de suelos y frentes de exploración de GEOCIENCES S.A.C. y es refrendado anualmente por la Gerencia General.`,
    ],
  },
  ADMINISTRADOR: {
    title: 'PROTOCOLO DE SEGURIDAD OPERATIVA Y GESTIÓN ADMINISTRATIVA DE RECURSOS',
    subtitle: 'Control Documentario, Homologación de Contratistas y Logística Segura • GEOCIENCES S.A.C.',
    version: 'P-ADM-002 Rev. 2026',
    lastUpdated: '10 de Noviembre de 2026',
    content: [
      `1. CONTROL DE HOMOLOGACIÓN Y VIGILANCIA DE CONTRATISTAS:
El Administrador de GEOCIENCES S.A.C. es el garante de que ningún colaborador, contratista, transportista o proveedor ingrese a las instalaciones de la empresa o frentes de obra minera sin haber superado el proceso integral de acreditación. Esto incluye la validación de exámenes médicos ocupacionales (EMO) vigentes con énfasis en aptitud para gran altitud geográfica (anexo 16A del D.S. 024-2016-EM), pólizas de SCTR Salud y Pensión con coberturas al día, y certificados de inducción general y específica de seguridad minera emitidos por instituciones certificadas.

2. ADQUISICIÓN Y CONTROL DE CALIDAD DE EPP:
El área de administración garantiza que todos los Equipos de Protección Personal (EPP) y sistemas anticaídas adquiridos para el personal cumplan estrictamente con las normas internacionales ANSI, OSHA, NIOSH y Normas Técnicas Peruanas (NTP). Se rechaza cualquier insumo que no cuente con su respectiva ficha técnica y certificado de conformidad de fábrica. La administración mantiene un stock de reserva permanente en almacén central para reemplazo inmediato de EPP deteriorado sin burocracia ni dilaciones que dejen desprotegido al obrero.

3. GESTIÓN SEGURA DE LA FLOTA Y TRANSPORTE TERRESTRE:
La administración coordina el mantenimiento preventivo programado de camionetas 4x4, camiones plataforma y grúas de izaje. Toda unidad que traslade personal hacia los proyectos mineros debe contar con jaula antivuelco interna y externa homologada, cinturones de seguridad de tres puntos en todos los asientos, botiquín de primeros auxilios para trauma, extintor de PQS vigente, tacos de bloqueo, conos de seguridad y sistema de monitoreo satelital GPS con alerta de exceso de velocidad (máximo 60 km/h en pistas no afirmadas de mina).

4. PROTOCOLOS EN SEDES ADMINISTRATIVAS Y ALMACENES:
En las oficinas centrales y almacenes de reactivos/repuestos, el Administrador lidera el cumplimiento de las normativas de Defensa Civil (INDECI). Mantiene despejadas las rutas de evacuación, asegura la operatividad de detectores de humo, alarmas sonoras, luces de emergencia y la señalética fotoluminiscente. Asimismo, lidera la conformación y entrenamiento trimestral de las brigadas de primeros auxilios, evacuación y lucha contra incendios.

5. REGISTRO Y ARCHIVO DE EVIDENCIAS AUDITABLES:
El Administrador custodia en formato físico y digitalizado en la nube institucional todas las actas mensuales del Comité de Seguridad (CSST), las hojas de datos de seguridad de materiales (MSDS) de aditivos y lubricantes de perforación, los registros de entrega de EPP con firma de los trabajadores y los reportes de inspección de maquinaria, garantizando trazabilidad ante auditorías de los clientes mineros y entidades fiscalizadoras.`,
    ],
  },
  RESIDENTE: {
    title: 'PROTOCOLO DE SUPERVISIÓN TÉCNICA Y SEGURIDAD OPERATIVA EN FRENTE DE OBRA',
    subtitle: 'Gestión Geotécnica de Campo, PETAR y Liderazgo Operacional • GEOCIENCES S.A.C.',
    version: 'P-RES-003 Rev. 2026',
    lastUpdated: '10 de Noviembre de 2026',
    content: [
      `1. LIDERAZGO OPERATIVO Y REUNIÓN DE INICIO DE GUARDIA (5 MINUTOS):
El Ingeniero Residente es la máxima autoridad técnica en el frente de exploración y perforación diamantina. Al inicio de cada turno de trabajo, el Residente lidera obligatoriamente la reunión de seguridad de cinco minutos con todas las cuadrillas, difundiendo los análisis de trabajo seguro (ATS) y evaluando las condiciones climáticas, geológicas y físicas del terreno antes de autorizar el encendido de cualquier equipo.

2. EMISIÓN Y AUTORIZACIÓN ESTRICTA DE PETAR:
Es responsabilidad indelegable del Residente verificar y firmar in situ los Permisos Escritos de Trabajo de Alto Riesgo (PETAR) para las siguientes actividades críticas: trabajos en altura (izaje de varillaje y armado de mástil de sonda > 1.80 m), trabajos en caliente (corte y soldadura de tuberías), trabajos en espacios confinados (inspección de pozos profundos o galerías), y excavación de zanjas o calicatas mayores a 1.50 metros de profundidad. Sin la presencia física y firma del Residente, queda prohibido iniciar dichas labores.

3. CONTROL DE ESTABILIDAD DE TALUDES Y RIESGOS GEOTÉCNICOS:
Dado el entorno montañoso y agreste de las exploraciones de GEOCIENCES S.A.C., el Residente realiza la evaluación visual continua de la roca y suelo adyacente a las plataformas de perforación. Si detecta agrietamientos de tensión, presencia de agua subterránea no prevista o indicios de desprendimiento de bloques, ordena la evacuación inmediata de la plataforma, el repliegue de la sonda hacia zona segura y la instalación de bermas o mallas de contención antes de reanudar las labores.

4. SUPERVISIÓN DE PERFORACIÓN DIAMANTINA Y FLUIDOS DE CORTE:
El Residente supervisa que las guardas protectoras de los componentes giratorios de la sonda (cabezal de rotación, chuck y cabrestante) se encuentren operativas y cerradas durante la operación. Controla que el sistema de circulación de lodos y aditivos biodegradables opere sin fugas de alta presión en mangueras flexibles, verificando que cada manguera cuente con chicotes de seguridad (whip checks) instalados en sus acoples para evitar latigazos en caso de desacople súbito.

5. CIERRE DE TURNO Y REGISTRO EN EL CUADERNO DE OBRA DIGITAL:
Al finalizar la jornada, el Residente asienta en el cuaderno de obra digital el estado de las herramientas, el metraje perforado, las horas trabajadas sin accidentes, las incidencias mecánicas y las observaciones de seguridad, asegurando una entrega de guardia transparente y segura con el supervisor entrante.`,
    ],
  },
  OBRERO: {
    title: 'MANUAL INTEGRAL DE SEGURIDAD EN CAMPO, EPP Y PREVENCIÓN DE ACCIDENTES PARA CUADRILLAS',
    subtitle: 'Normas de Vida para Operadores de Perforación, Muestreros y Ayudantes • GEOCIENCES S.A.C.',
    version: 'P-OBR-004 Rev. 2026',
    lastUpdated: '10 de Noviembre de 2026',
    content: [
      `1. DERECHO A DECIR 'NO' (POLÍTICA DE TRABAJO INSEGURO):
Como colaborador de GEOCIENCES S.A.C., tienes el derecho legal, humano y moral de NEGsession y negarte a realizar cualquier tarea si consideras que las condiciones de trabajo ponen en peligro inminente tu vida o la de tus compañeros. Si una máquina falla, si el talud está inestable o si no cuentas con tu EPP completo, detén el trabajo y avisa inmediatamente a tu supervisor o residente. La empresa te respalda totalmente.

2. EQUIPO DE PROTECCIÓN PERSONAL (EPP) OBLIGATORIO:
Antes de pisar la plataforma de trabajo, debes vestir obligatoriamente:
- Casco de seguridad con barbiquejo ajustado en todo momento para evitar caídas de objetos.
- Lentes de seguridad con protección lateral antiempañante (claros para turno día nublado y oscuros con filtro UV para sol de puna).
- Zapatos o botas de seguridad con puntera de acero reforzada, suela antideslizante y dieléctrica.
- Guantes de seguridad anticorte nivel 5 para manipulación de varillaje, tuberías y testigos de roca. Para lodos químicos, usar guantes de nitrilo de manga larga.
- Protección auditiva de copa o tapones tipo bala en zonas donde el motor diésel o la bomba de lodos esté encendida.
- Respirador de media cara con filtros P100 para polvo mineral y partículas de sílice.
- Ropa de trabajo reflectiva de alta visibilidad para que los operadores de maquinaria pesada puedan verte a más de 50 metros.

3. REGLAS DE ORO EN LA PLATAFORMA DE PERFORACIÓN:
- Cero ropa suelta: Jamás uses chalecos sueltos, capuchas desatadas ni cadenas cerca del cabezal de rotación o del varillaje. El riesgo de atrapamiento es fatal.
- Mantén las manos fuera de la línea de fuego: Nunca sostengas con la mano tubos en rotación ni intentes limpiar el testigo mientras la sarta esté girando. Utiliza siempre llaves stilson, llaves de cadena o tenazas mecánicas adecuadas.
- Cuidado con los puntos de pellizco (Pinch Points): Al acoplar o desacoplar tuberías HQ/NQ, mantén los dedos alejados de las roscas y uniones. Coordina por señas claras con el perforista titular.
- Paradas de Emergencia (E-STOP): Conoce la ubicación exacta del botón de parada de emergencia de la sonda y de la bomba de lodos. Pruébalo al iniciar el turno. En caso de anomalía, golpéalo de inmediato.

4. MANEJO DE HERRAMIENTAS Y ORDEN EN EL FRENTE:
- Aplica las 5S: Mantén la plataforma limpia de lodo acumulado, aceites y grasas para evitar resbalones y caídas a nivel.
- Las herramientas manuales deben estar atadas con driza de seguridad si trabajas sobre el mástil de la sonda para evitar que caigan sobre tus compañeros.
- Disposición de testigos: Traslada las cajas portatestigos con posturas ergonómicas (flexionando las rodillas y manteniendo la espalda recta, carga máxima individual: 25 kg). Si la caja pesa más, solicita ayuda para levantamiento en equipo.

5. PROTECCIÓN CONTRA TORMENTAS ELÉCTRICAS Y CLIMA EXTREMO:
En la cordillera, las tormentas eléctricas son un peligro mortal. Si el detector de tormentas alerta alarma amarilla o roja (rayos a menos de 10 km) o si la sirena de mina se activa, apaga la maquinaria inmediatamente, aléjate de las estructuras metálicas y del mástil de la sonda, y refúgiate dentro de la camioneta 4x4 con las ventanas totalmente cerradas hasta que el supervisor autorice el reinicio.

6. REPORTE INMEDIATO DE INCIDENTES:
Cualquier rasguño, corte o casi-accidente debe reportarse al residente en el mismo turno. Recuerda: tu familia te espera en casa completo y sano al final de cada guardia.`,
    ],
  },
};
