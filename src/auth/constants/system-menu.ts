import { VALID_ACTIONS, VALID_RESOURCES } from './valid-resources.enum';

export interface Menu {
  resource: VALID_RESOURCES;
  text: string;
  icon: string;
  routerLink: string;
  children?: {
    resource: VALID_ACTIONS;
    text: string;
    icon: string;
    routerLink: string;
  }[];
}
export const SYSTEM_MENU: Menu[] = [
  {
    resource: VALID_RESOURCES.institutions,
    text: 'Instituciones',
    icon: 'apartment',
    routerLink: 'institutions',
  },
  {
    resource: VALID_RESOURCES.dependencies,
    text: 'Dependencias',
    icon: 'holiday_village',
    routerLink: 'dependencies',
  },
  {
    resource: VALID_RESOURCES.typeProcedures,
    text: 'Tipos de tramite',
    icon: 'summarize',
    routerLink: 'types-procedures',
  },
  {
    resource: VALID_RESOURCES.officers,
    text: 'Funcionarios',
    icon: 'person',
    routerLink: 'officers',
  },
  {
    resource: VALID_RESOURCES.jobs,
    text: 'Cargos',
    icon: 'badge',
    routerLink: 'jobs',
  },
  {
    resource: VALID_RESOURCES.roles,
    text: 'Roles',
    icon: 'verified_user',
    routerLink: 'roles',
  },
  {
    resource: VALID_RESOURCES.accounts,
    text: 'Cuentas',
    icon: 'account_circle',
    routerLink: 'accounts',
  },
  {
    resource: VALID_RESOURCES.external,
    text: 'Tramites externos',
    icon: 'folder_shared',
    routerLink: 'external',
  },
  {
    resource: VALID_RESOURCES.internal,
    text: 'Tramites internos',
    icon: 'folder',
    routerLink: 'internal',
  },
  {
    resource: VALID_RESOURCES.communication,
    text: 'Bandeja de entrada',
    icon: 'drafts',
    routerLink: 'inbox',
  },
  {
    resource: VALID_RESOURCES.communication,
    text: 'Bandeja de salida',
    icon: 'mark_as_unread',
    routerLink: 'outbox',
  },
  {
    resource: VALID_RESOURCES.archived,
    text: 'Archivos',
    icon: 'folder_copy',
    routerLink: 'archives',
  },
  {
    text: 'Reportes',
    icon: 'equalizer',
    resource: VALID_RESOURCES.reports,
    routerLink: '',
    children: [
      {
        resource: VALID_ACTIONS.applicant,
        text: 'Busquedas',
        icon: 'search',
        routerLink: 'reports/search',
      },
      {
        resource: VALID_ACTIONS.search,
        text: 'Solicitante',
        icon: 'folder_copy',
        routerLink: 'reports/applicant',
      },
    ],
  },
];
