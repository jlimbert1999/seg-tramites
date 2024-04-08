import { VALID_RESOURCES } from './valid-resources.enum';

export const SYSTEM_RESOURCES = [
  {
    value: VALID_RESOURCES.institutions,
    label: 'INSTITUCIONES',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.dependencies,
    label: 'DEPENDENCIAS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.accounts,
    label: 'CUENTAS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.roles,
    label: 'ROLES',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.officers,
    label: 'FUNCIONARIOS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.jobs,

    label: 'CARGOS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.typeProcedures,

    label: 'TIPOS DE TRAMITES',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },

  {
    value: VALID_RESOURCES.external,

    label: 'TRAMITES EXTERNOS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.internal,

    label: 'TRAMITES INTERNOS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.archived,

    label: 'ARCHIVOS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: VALID_RESOURCES.communication,

    label: 'BANDEJAS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar ' },
      { value: 'delete', label: 'Actualizar' },
    ],
  },
  {
    value: VALID_RESOURCES.reports,
    label: 'REPORTES',

    actions: [
      { value: 'applicants', label: 'Solicitante' },
      { value: 'search', label: 'Busquedas' },
      { value: 'dependents', label: 'Dependientes' },
    ],
  },
  {
    value: VALID_RESOURCES.groupware,
    label: 'GRUPO DE TRABAJO',

    actions: [{ value: 'manage', label: 'Administrar' }],
  },
];
