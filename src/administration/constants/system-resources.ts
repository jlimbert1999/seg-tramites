import { validResource } from '../../auth/interfaces';

export const SYSTEM_RESOURCES = [
  {
    value: validResource.institutions,
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
    value: validResource.dependencies,
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
    value: validResource.accounts,
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
    value: validResource.roles,
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
    value: validResource.officers,
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
    value: validResource.jobs,
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
    value: validResource.typeProcedures,
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
    value: validResource.external,
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
    value: validResource.internal,
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
    value: validResource.communication,
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
    value: validResource.reports,
    label: 'REPORTES',
    isSelected: false,
    actions: [
      { value: 'advanced-search', label: 'Busqueda avanzada', isSelected: false },
      { value: 'quick-search', label: 'Busqueda rapida', isSelected: false },
      { value: 'simple-search', label: 'Busqueda simple', isSelected: false },
      { value: 'applicant', label: 'Solicitante', isSelected: false },
    ],
  },
];
