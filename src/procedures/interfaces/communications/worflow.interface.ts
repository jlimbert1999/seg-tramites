import { statusMail } from '../status.interface';

export interface workflow {
  _id: ID;
  detail: Detail[];
}

interface ID {
  emitterAccount: string;
  outboundDate: Date;
  duration: string;
}

interface Detail {
  _id: string;
  emitter: officer;
  receiver: officer;
  procedure: string;
  reference: string;
  attachmentQuantity: string;
  internalNumber: string;
  status: statusMail;
  outboundDate: Date;
  inboundDate?: Date;
  eventLog?: EventLog;
}

interface EventLog {
  manager: string;
  description: string;
  date: string;
}

interface officer {
  cuenta: string;
  fullname: string;
  jobtitle?: string;
}
