export enum SystemResource {
  USERS = 'user',
  ROLES = 'roles',

  INSTITUTIONS = 'institutions',
  DEPENDENCIES = 'dependencies',
  OFFICERS = 'officers',
  ACCOUNTS = 'accounts',
  TYPES_PROCEDURES = 'types-procedures',

  EXTERNAL = 'external',
  INTERNAL = 'internal',

  communication = 'communication',
  groupware = 'groupware',
  archived = 'archived',
  reports = 'reports',
  jobs = 'jobs',
  publications = 'publications',
}

export const SYSTEM_RESOURCES = [
  {
    value: SystemResource.INSTITUTIONS,
    label: 'Instituciones',
    actions: [
      { value: 'read', label: 'Ver' },
      { value: 'create', label: 'Crear' },
      { value: 'update', label: 'Editar' },
    ],
  },
  {
    value: SystemResource.DEPENDENCIES,
    label: 'Dependencias',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
    ],
  },
  {
    value: SystemResource.OFFICERS,
    label: 'Funcionarios',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },

  {
    value: SystemResource.ACCOUNTS,
    label: 'Cuentas',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: SystemResource.USERS,
    label: 'Usuarios',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: SystemResource.ROLES,
    label: 'Roles',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  // {
  //   value: SystemResource.jobs,

  //   label: 'CARGOS',
  //   actions: [
  //     { value: 'create', label: 'Crear' },
  //     { value: 'read', label: 'Ver' },
  //     { value: 'update', label: 'Editar' },
  //     { value: 'delete', label: 'Eliminar' },
  //   ],
  // },
  {
    value: SystemResource.TYPES_PROCEDURES,
    label: 'TIPOS DE TRAMITES',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: SystemResource.groupware,
    label: 'GRUPO DE TRABAJO',
    actions: [{ value: 'manage', label: 'Administrar' }],
  },
  {
    value: SystemResource.publications,
    label: 'PUBLICACIONES',
    actions: [{ value: 'manage', label: 'Administrar' }],
  },
  {
    value: SystemResource.archived,

    label: 'ARCHIVOS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: SystemResource.communication,
    label: 'BANDEJAS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar ' },
      { value: 'delete', label: 'Actualizar' },
    ],
  },
  {
    value: SystemResource.reports,
    label: 'REPORTES',

    actions: [
      { value: 'applicants', label: 'Solicitante' },
      { value: 'search', label: 'Busquedas' },
      { value: 'dependents', label: 'Dependientes' },
      { value: 'unit', label: 'Unidades' },
    ],
  },
];
export const PROCEDURES = [
  {
    value: SystemResource.EXTERNAL,
    label: 'TRAMITES EXTERNOS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
  {
    value: SystemResource.INTERNAL,
    label: 'TRAMITES INTERNOS',
    actions: [
      { value: 'create', label: 'Crear' },
      { value: 'read', label: 'Ver' },
      { value: 'update', label: 'Editar' },
      { value: 'delete', label: 'Eliminar' },
    ],
  },
];
