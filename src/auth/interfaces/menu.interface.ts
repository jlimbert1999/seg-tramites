import { VALID_RESOURCES } from '../constants';

export interface Menu {
  resource: string;
  text: string;
  icon: string;
  routerLink: string;
  children?: SubMemu[];
}

interface SubMemu {
  resource: VALID_RESOURCES;
  text: string;
  icon: string;
  routerLink: string;
}
