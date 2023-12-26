import { statusMail } from '../status.interface';

export interface workflow {
  _id: ID;
  detail: Detail[];
}

export interface ID {
  emitterAccount: string;
  outboundDate: Date;
  duration: string;
}

export interface Detail {
  _id: string;
  emitter: Emitter;
  receiver: Receiver;
  procedure: string;
  reference: string;
  attachmentQuantity: string;
  internalNumber: string;
  outboundDate: Date;
  inboundDate?: Date;
  status: statusMail;
  rejectionReason?: string;
}

export interface Emitter {
  cuenta: string;
  fullname: string;
  jobtitle?: string;
}

export interface Receiver {
  cuenta: string;
  fullname: string;
  jobtitle?: string;
  duration: string;
}
