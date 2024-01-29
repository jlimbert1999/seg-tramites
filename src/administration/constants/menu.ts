import { validResource } from '../../auth/interfaces/valid-resources.enum';

export const ADMINISTRATION_MENU = [
  {
    resource: validResource.institutions,
    text: 'Instituciones',
    icon: 'apartment',
    routerLink: 'institutions',
  },
  {
    resource: validResource.dependencies,
    text: 'Dependencias',
    icon: 'holiday_village',
    routerLink: 'dependencies',
  },
  {
    resource: validResource.typeProcedures,
    text: 'Tipos de tramite',
    icon: 'summarize',
    routerLink: 'configuraciones/tipos',
  },
  {
    resource: validResource.officers,
    text: 'Funcionarios',
    icon: 'person',
    routerLink: 'configuraciones/funcionarios',
  },
  {
    resource: validResource.jobs,
    text: 'Cargos',
    icon: 'badge',
    routerLink: 'configuraciones/cargos',
  },
];
