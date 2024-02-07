export interface workflow {
  _id: ID;
  dispatches: Dispatch[];
}

interface ID {
  emitter: Participant;
  date: Date;
}

interface Dispatch {
  _id: string;
  receiver: Participant;
  reference: string;
  date?: Date;
  attachmentQuantity: string;
  status: string;
}

interface Participant {
  cuenta: string;
  fullname: string;
  jobtitle: string;
}
