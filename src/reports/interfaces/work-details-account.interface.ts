import { statusMail } from 'src/procedures/interfaces';

export interface workDetailsAccount {
  numberOfRecords: {
    external?: number;
    internal?: number;
  };
  numberOfShipments: {
    [key in statusMail]?: number;
  };
}
