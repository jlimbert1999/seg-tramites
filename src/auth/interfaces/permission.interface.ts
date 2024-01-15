import { validResource } from './valid-resources.enum';

export interface permission {
  resource: validResource;
  actions?: string;
}
