import { SystemResource } from '../constants';

export interface Menu {
  resource: string;
  text: string;
  icon: string;
  routerLink: string;
  children?: SubMemu[];
}

interface SubMemu {
  resource: SystemResource;
  text: string;
  icon: string;
  routerLink: string;
}
