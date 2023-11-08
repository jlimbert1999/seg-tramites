import { validResources } from './valid-resources.interface';

export interface permission {
  resource: validResources;
  actions?: string;
}
