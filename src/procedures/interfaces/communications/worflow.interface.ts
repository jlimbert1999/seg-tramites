import { statusMail } from '../status.interface';

export interface workflow {
  _id: ID;
  detail: Detail[];
}

export interface ID {
  emitterAccount: string;
  duration?: string;
  outboundDate: string;
}

export interface Detail {
  _id: string;
  emitter: Emitter;
  receiver: Emitter;
  procedure: string;
  reference: string;
  attachmentQuantity: string;
  internalNumber: string;
  outboundDate: string;
  inboundDate?: string;
  status: statusMail;
}

export interface Emitter {
  cuenta: string;
  fullname: string;
  jobtitle?: string;
}
