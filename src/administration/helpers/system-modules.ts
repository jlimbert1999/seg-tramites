import { validResources } from 'src/auth/interfaces/valid-resources.interface';

export const systemModules = [
  {
    group: 'Administracion de tramites',
    resources: [
      {
        value: validResources.external,
        text: 'Externos',
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
        value: validResources.communication,
        text: 'Entrada y salida',
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
    resources: [
      {
        value: validResources.typeProcedures,
        text: 'Tipos de tramites',
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
        actions: [
          { value: 'create', viewValue: 'Crear' },
          { value: 'read', viewValue: 'Ver' },
          { value: 'update', viewValue: 'Editar' },
          { value: 'delete', viewValue: 'Eliminar' },
        ],
      },
      {
        value: validResources.dependencies,
        text: 'Dependencias',
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
    resources: [
      {
        value: validResources.accounts,
        text: 'Cuentas',
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
