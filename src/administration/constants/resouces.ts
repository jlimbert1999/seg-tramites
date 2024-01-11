import { validResources } from 'src/auth/interfaces/valid-resources.interface';

export const SystemResources = [
  {
    value: validResources.external,
    label: 'Externos',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.internal,
    label: 'Internos',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.archived,
    label: 'Archivos',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.communication,
    label: 'Entrada y salida',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.typeProcedures,
    label: 'Tipos de tramites',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.roles,
    label: 'Roles',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.institutions,
    label: 'Instituciones',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.dependencies,
    label: 'Dependencias',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.accounts,
    label: 'Cuentas',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.officers,
    label: 'Funcionarios',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.jobs,
    label: 'Cargos',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: validResources.reports,
    label: 'Reportes',
    actions: [
      { value: 'advanced-search', label: 'Busqueda avanzada' },
      { value: 'quick-search', label: 'Busqueda rapida' },
      { value: 'simple-search', label: 'Busqueda simple' },
      { value: 'applicant', label: 'Solicitante' },
    ],
  },
];
