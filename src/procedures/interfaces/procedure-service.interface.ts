import { Procedure } from '../schemas';

export interface ValidProcedureService {
  getProcedureDetail(id_procedure: string): Promise<Procedure>;
}
