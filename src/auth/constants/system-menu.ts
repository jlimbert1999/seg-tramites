import { validResources } from '../interfaces/valid-resources.interface';

export const SystemMenu = [
  {
    resource: validResources.external,
    text: 'Tramites externos',
    icon: 'folder_shared',
    routerLink: 'tramites/externos',
    group: {
      text: 'Administracion',
      icon: 'description',
    },
  },
  {
    resource: validResources.internal,
    text: 'Tramites internos',
    icon: 'folder',
    routerLink: 'tramites/internos',
    group: {
      text: 'Administracion',
      icon: 'description',
    },
  },
  {
    resource: validResources.archived,
    text: 'Archivos',
    icon: 'folder_copy',
    routerLink: 'archivos',
  },
  {
    resource: validResources.communication,
    text: 'Bandeja de entrada',
    icon: 'mail',
    routerLink: 'bandejas/entrada',
    group: {
      text: 'Bandejas',
      icon: 'description',
    },
  },
  {
    resource: validResources.communication,
    text: 'Bandeja de salida',
    icon: 'mark_as_unread',
    routerLink: 'bandejas/salida',
    group: {
      text: 'Bandejas',
      icon: 'description',
    },
  },
];
