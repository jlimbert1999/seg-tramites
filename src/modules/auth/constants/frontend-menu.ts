import { Menu } from '../interfaces';
import { SystemResource } from './system-resources';

export const FRONTEND_MENU: Menu[] = [
  {
    resource: SystemResource.USERS,
    text: 'Usuarios',
    icon: 'account_circle',
    routerLink: 'usuarios',
  },
  {
    resource: SystemResource.ROLES,
    text: 'Roles',
    icon: 'verified_user',
    routerLink: 'roles',
  },
  {
    text: 'Configuraciones',
    children: [
      {
        resource: 'institutions',
        text: 'Instituciones',
        icon: 'apartment',
        routerLink: 'institutions',
      },
      {
        resource: 'dependencies',
        text: 'Dependencias',
        icon: 'holiday_village',
        routerLink: 'dependencies',
      },
      {
        resource: 'officers',
        text: 'Funcionarios',
        icon: 'person',
        routerLink: 'officers',
      },
      {
        resource: 'accounts',
        text: 'Cuentas',
        icon: 'assignment_ind',
        routerLink: 'accounts',
      },
      {
        resource: 'types-procedures',
        text: 'Tramites',
        icon: 'summarize',
        routerLink: 'types-procedures',
      },
    ],
  },

  {
    resource: 'external',
    text: 'Tramites externos',
    icon: 'folder_shared',
    routerLink: 'external',
  },
  {
    resource: 'internal',
    text: 'Tramites internos',
    icon: 'folder',
    routerLink: 'internal',
  },
  {
    resource: 'communication',
    text: 'Bandeja de entrada',
    icon: 'drafts',
    routerLink: 'inbox',
  },
  {
    resource: 'communication',
    text: 'Bandeja de salida',
    icon: 'mark_as_unread',
    routerLink: 'outbox',
  },
  {
    resource: 'archived',
    text: 'Archivos',
    icon: 'folder_copy',
    routerLink: 'archives',
  },
  {
    resource: 'reports',
    text: 'Reportes',
    icon: 'equalizer',
    routerLink: 'reports',
  },
  {
    text: 'Grupo de trabajo',
    icon: 'equalizer',
    children: [
      {
        resource: 'groupware',
        text: 'Usuarios activos',
        icon: 'equalizer',
        routerLink: 'groupware/users',
      },
      {
        resource: 'publications',
        text: 'Publicaciones',
        icon: 'newspaper',
        routerLink: 'posts/manage',
      },
    ],
  },
];
