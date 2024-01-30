import { VALID_RESOURCES } from './valid-resources.enum';

export interface Menu {
  resource?: VALID_RESOURCES;
  text: string;
  icon: string;
  routerLink: string;
  children?: {
    resource: VALID_RESOURCES;
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
    routerLink: 'configuraciones/tipos',
  },
  {
    resource: VALID_RESOURCES.officers,
    text: 'Funcionarios',
    icon: 'person',
    routerLink: 'configuraciones/funcionarios',
  },
  {
    resource: VALID_RESOURCES.jobs,
    text: 'Cargos',
    icon: 'badge',
    routerLink: 'configuraciones/cargos',
  },
  {
    resource: VALID_RESOURCES.roles,
    text: 'Roles',
    icon: 'verified_user',
    routerLink: 'configuraciones/roles',
  },
  {
    resource: VALID_RESOURCES.accounts,
    text: 'Cuentas',
    icon: 'account_circle',
    routerLink: 'configuraciones/cuentas',
  },
  {
    resource: VALID_RESOURCES.external,
    text: 'Tramites externos',
    icon: 'folder_shared',
    routerLink: 'tramites/externos',
  },
  {
    resource: VALID_RESOURCES.internal,
    text: 'Tramites internos',
    icon: 'folder',
    routerLink: 'tramites/internos',
  },
  {
    resource: VALID_RESOURCES.communication,
    text: 'Bandeja de entrada',
    icon: 'drafts',
    routerLink: 'bandejas/entrada',
  },
  {
    resource: VALID_RESOURCES.communication,
    text: 'Bandeja de salida',
    icon: 'mark_as_unread',
    routerLink: 'bandejas/salida',
  },
  {
    resource: VALID_RESOURCES.archived,
    text: 'Archivos',
    icon: 'folder_copy',
    routerLink: 'tramites/archivados',
  },
];
