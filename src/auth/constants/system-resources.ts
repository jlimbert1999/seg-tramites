import { VALID_ACTIONS, VALID_RESOURCES } from './valid-resources.enum';

export const SYSTEM_RESOURCES = [
  {
    value: VALID_RESOURCES.institutions,
    isSelected: false,
    label: 'INSTITUCIONES',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.dependencies,
    isSelected: false,
    label: 'DEPENDENCIAS',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.accounts,
    isSelected: false,
    label: 'CUENTAS',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.roles,
    isSelected: false,
    label: 'ROLES',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.officers,
    isSelected: false,
    label: 'FUNCIONARIOS',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.jobs,
    isSelected: false,
    label: 'CARGOS',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.typeProcedures,
    isSelected: false,
    label: 'TIPOS DE TRAMITES',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },

  {
    value: VALID_RESOURCES.external,
    isSelected: false,
    label: 'TRAMITES EXTERNOS',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.internal,
    isSelected: false,
    label: 'TRAMITES INTERNOS',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.archived,
    isSelected: false,
    label: 'ARCHIVOS',
    actions: [
      { value: 'create', label: 'Crear', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar', isSelected: false },
      { value: 'delete', label: 'Eliminar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.communication,
    isSelected: false,
    label: 'BANDEJAS',
    actions: [
      { value: 'create', label: 'Create', isSelected: false },
      { value: 'read', label: 'Ver', isSelected: false },
      { value: 'update', label: 'Editar ', isSelected: false },
      { value: 'delete', label: 'Actualizar', isSelected: false },
    ],
  },
  {
    value: VALID_RESOURCES.reports,
    label: 'REPORTES',
    isSelected: false,
    actions: [
      { value: VALID_ACTIONS.applicant, label: 'Solicitante', isSelected: false },
      { value: VALID_ACTIONS.search, label: 'Busquedas', isSelected: false },
      { value: 'dependents', label: 'Dependientes', isSelected: false },
    ],
  },
];
