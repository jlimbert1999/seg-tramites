import { validResource } from '../../auth/interfaces/valid-resources.enum';

export const SYSTEM_MENU = [
  {
    resource: validResource.typeProcedures,
    text: 'Tipos de tramite',
    icon: 'folder_shared',
    routerLink: 'configuraciones/tipos',
    group: {
      text: 'Configuraciones',
      icon: 'settings',
    },
  },
  {
    resource: validResource.dependencies,
    text: 'Dependencias',
    icon: 'folder_shared',
    routerLink: 'configuraciones/dependencias',
    group: {
      text: 'Configuraciones',
      icon: 'settings',
    },
  },
  {
    resource: validResource.institutions,
    text: 'Instituciones',
    icon: 'folder_shared',
    routerLink: 'configuraciones/instituciones',
    group: {
      text: 'Configuraciones',
      icon: 'settings',
    },
  },
  {
    resource: validResource.roles,
    text: 'Roles',
    icon: 'folder_shared',
    routerLink: 'configuraciones/roles',
    group: {
      text: 'Configuraciones',
      icon: 'settings',
    },
  },
  {
    resource: validResource.accounts,
    text: 'Funcionarios',
    icon: 'folder_shared',
    routerLink: 'configuraciones/funcionarios',
    group: {
      text: 'Usuarios',
      icon: 'user',
    },
  },
  {
    resource: validResource.accounts,
    text: 'Cargos',
    icon: 'folder_shared',
    routerLink: 'configuraciones/cargos',
    group: {
      text: 'Usuarios',
      icon: 'user',
    },
  },
  {
    resource: validResource.accounts,
    text: 'Cuentas',
    icon: 'folder_shared',
    routerLink: 'configuraciones/cuentas',
    group: {
      text: 'Usuarios',
      icon: 'user',
    },
  },
  {
    resource: validResource.external,
    text: 'Tramites externos',
    icon: 'folder_shared',
    routerLink: 'tramites/externos',
  },
  {
    resource: validResource.internal,
    text: 'Tramites internos',
    icon: 'folder',
    routerLink: 'tramites/internos',
  },
  {
    resource: validResource.archived,
    text: 'Archivos',
    icon: 'folder_copy',
    routerLink: 'tramites/archivados',
  },
  {
    resource: validResource.communication,
    text: 'Bandeja de entrada',
    icon: 'drafts',
    routerLink: 'bandejas/entrada',
  },
  {
    resource: validResource.communication,
    text: 'Bandeja de salida',
    icon: 'mark_as_unread',
    routerLink: 'bandejas/salida',
  },
  {
    resource: validResource.communication,
    text: 'Solicitante',
    icon: 'manage_search',
    routerLink: 'reportes/solicitante',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResource.communication,
    text: 'Busquedas',
    icon: 'manage_search',
    routerLink: 'reportes/busqueda-tramite',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResource.communication,
    text: 'Busqueda avanzada',
    icon: 'manage_search',
    routerLink: 'reportes/busqueda-avanzada',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResource.communication,
    text: 'Unidad',
    icon: 'manage_search',
    routerLink: 'reportes/unidad',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResource.communication,
    text: 'Dependientes',
    icon: 'manage_search',
    routerLink: 'reportes/dependientes',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },

  {
    resource: validResource.communication,
    text: 'Informe mas general',
    icon: 'manage_search',
    routerLink: 'reportes/total',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResource.communication,
    text: 'Ranking usuarios',
    icon: 'manage_search',
    routerLink: 'reportes/ranking',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
];
