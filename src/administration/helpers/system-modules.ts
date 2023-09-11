import { validResources } from 'src/auth/interfaces/valid-resources.interface';

export const systemModules = [
  {
    group: 'Tramites',
    icon: 'description',
    resources: [
      {
        value: validResources.external,
        text: 'Externos',
        icon: 'folder_shared',
        routerLink: 'tramites/externos',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.internal,
        text: 'Internos',
        icon: 'folder',
        routerLink: 'tramites/internos',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.archived,
        text: 'Archivos',
        icon: 'folder_copy',
        routerLink: 'archivos',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
    ],
  },
  {
    group: 'Bandejas',
    icon: 'inbox',
    resources: [
      {
        value: validResources.inbox,
        text: 'Bandeja de entrada',
        icon: 'mail',
        routerLink: 'bandejas/entrada',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.outbox,
        text: 'Bandeja de salida',
        icon: 'mark_as_unread',
        routerLink: 'bandejas/salida',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
    ],
  },
  {
    group: 'Configuraciones',
    icon: 'tune',
    resources: [
      {
        value: validResources.typeProcedures,
        text: 'Tipos de tramites',
        icon: 'format_list_bulleted',
        routerLink: 'configuraciones/tipos',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.roles,
        text: 'Roles',
        icon: 'security',
        routerLink: 'configuraciones/roles',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.institutions,
        text: 'Instituciones',
        icon: 'apartment',
        routerLink: 'configuraciones/instituciones',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.dependences,
        text: 'Dependencias',
        icon: 'holiday_village',
        routerLink: 'configuraciones/dependencias',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
    ],
  },
  {
    group: 'Usuarios',
    icon: 'admin_panel_settings',
    resources: [
      {
        value: validResources.accounts,
        text: 'Cuentas',
        icon: 'account_circle',
        routerLink: 'configuraciones/cuentas',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.officers,
        text: 'Funcionarios',
        icon: 'person',
        routerLink: 'configuraciones/funcionarios',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.jobs,
        text: 'Cargos',
        icon: 'assignment_ind',
        routerLink: 'configuraciones/cargos',
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
    ],
  },
];
