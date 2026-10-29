export type Opportunity = { name: string; country: string | null; kind: 'study' | 'work'; url: string; es: string; en: string };
// Directories, not live vacancies: eligibility and deadlines belong to the official source.
export const opportunities: Opportunity[] = [
  { name: 'PRONABEC', country: 'PE', kind: 'study', url: 'https://www.gob.pe/pronabec', es: 'Becas y crédito educativo en Perú. Consulta las bases de cada convocatoria.', en: 'Scholarships and education loans in Peru. Check the rules for each call.' },
  { name: 'Empleos Perú', country: 'PE', kind: 'work', url: 'https://www.empleosperu.gob.pe/', es: 'Portal del Ministerio de Trabajo para buscar empleo y servicios de orientación.', en: 'Ministry of Labour portal for job searches and career guidance.' },
  { name: 'Becas de Educación', country: 'ES', kind: 'study', url: 'https://www.becaseducacion.gob.es/', es: 'Información oficial sobre becas y ayudas para estudiar en España.', en: 'Official information about education grants and scholarships in Spain.' },
  { name: 'Empléate', country: 'ES', kind: 'work', url: 'https://www.empleate.gob.es/', es: 'Portal público de empleo del SEPE.', en: 'Public employment portal from SEPE.' },
  { name: 'ICETEX', country: 'CO', kind: 'study', url: 'https://web.icetex.gov.co/', es: 'Becas, financiación y oportunidades de formación.', en: 'Scholarships, funding and learning opportunities.' },
  { name: 'Servicio Público de Empleo', country: 'CO', kind: 'work', url: 'https://www.serviciodeempleo.gov.co/', es: 'Servicios oficiales de orientación y búsqueda de empleo.', en: 'Official career guidance and employment services.' },
  { name: 'Portal del Empleo', country: 'MX', kind: 'work', url: 'https://www.empleo.gob.mx/', es: 'Ofertas y orientación del Servicio Nacional de Empleo.', en: 'Vacancies and guidance from the National Employment Service.' },
  { name: 'Beneficios Estudiantiles', country: 'CL', kind: 'study', url: 'https://portal.beneficiosestudiantiles.cl/', es: 'Becas y ayudas oficiales para educación superior.', en: 'Official higher education scholarships and support.' },
  { name: 'Erasmus Mundus', country: null, kind: 'study', url: 'https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters', es: 'Explora másteres conjuntos y sus opciones de becas. Los requisitos dependen del programa.', en: 'Explore joint master’s degrees and scholarship options. Requirements vary by programme.' },
  { name: 'UN Careers', country: null, kind: 'work', url: 'https://careers.un.org/', es: 'Consulta oportunidades y prácticas de Naciones Unidas; revisa los requisitos de cada puesto.', en: 'Explore United Nations opportunities and internships; check each position’s requirements.' },
];
export function opportunitiesFor(country: string) {
  return opportunities.filter(item => item.country === country || item.country === null);
}
