import { validResources } from '../interfaces/valid-resources.interface';

export const SystemMenu = [
  {
    resource: validResources.typeProcedures,
    text: 'Tipos de tramite',
    icon: 'folder_shared',
    routerLink: 'configuraciones/tipos',
    group: {
      text: 'Configuraciones',
      icon: 'settings',
    },
  },
  {
    resource: validResources.dependencies,
    text: 'Dependencias',
    icon: 'folder_shared',
    routerLink: 'configuraciones/dependencias',
    group: {
      text: 'Configuraciones',
      icon: 'settings',
    },
  },
  {
    resource: validResources.institutions,
    text: 'Instituciones',
    icon: 'folder_shared',
    routerLink: 'configuraciones/instituciones',
    group: {
      text: 'Configuraciones',
      icon: 'settings',
    },
  },
  {
    resource: validResources.roles,
    text: 'Roles',
    icon: 'folder_shared',
    routerLink: 'configuraciones/roles',
    group: {
      text: 'Configuraciones',
      icon: 'settings',
    },
  },
  {
    resource: validResources.accounts,
    text: 'Funcionarios',
    icon: 'folder_shared',
    routerLink: 'configuraciones/funcionarios',
    group: {
      text: 'Usuarios',
      icon: 'user',
    },
  },
  {
    resource: validResources.accounts,
    text: 'Cargos',
    icon: 'folder_shared',
    routerLink: 'configuraciones/cargos',
    group: {
      text: 'Usuarios',
      icon: 'user',
    },
  },
  {
    resource: validResources.accounts,
    text: 'Cuentas',
    icon: 'folder_shared',
    routerLink: 'configuraciones/cuentas',
    group: {
      text: 'Usuarios',
      icon: 'user',
    },
  },
  {
    resource: validResources.external,
    text: 'Tramites externos',
    icon: 'folder_shared',
    routerLink: 'tramites/externos',
  },
  {
    resource: validResources.internal,
    text: 'Tramites internos',
    icon: 'folder',
    routerLink: 'tramites/internos',
  },
  {
    resource: validResources.archived,
    text: 'Archivos',
    icon: 'folder_copy',
    routerLink: 'tramites/archivados',
  },
  {
    resource: validResources.communication,
    text: 'Bandeja de entrada',
    icon: 'drafts',
    routerLink: 'bandejas/entrada',
  },
  {
    resource: validResources.communication,
    text: 'Bandeja de salida',
    icon: 'mark_as_unread',
    routerLink: 'bandejas/salida',
  },
  {
    resource: validResources.communication,
    text: 'Solicitante',
    icon: 'manage_search',
    routerLink: 'reportes/solicitante',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResources.communication,
    text: 'Busqueda rapida',
    icon: 'manage_search',
    routerLink: 'reportes/busqueda',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResources.communication,
    text: 'Busqueda avanzada',
    icon: 'manage_search',
    routerLink: 'reportes/busqueda-avanzada',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResources.communication,
    text: 'Dependientes',
    icon: 'manage_search',
    routerLink: 'reportes/dependientes',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResources.communication,
    text: 'Unidad',
    icon: 'manage_search',
    routerLink: 'reportes/unidad',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },

  {
    resource: validResources.communication,
    text: 'Informe general',
    icon: 'manage_search',
    routerLink: 'reportes/dashboard',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
  {
    resource: validResources.communication,
    text: 'Informe mas general',
    icon: 'manage_search',
    routerLink: 'reportes/total',
    group: {
      text: 'Reportes',
      icon: 'analytics',
    },
  },
];
