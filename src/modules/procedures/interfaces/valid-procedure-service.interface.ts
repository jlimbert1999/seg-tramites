import { Procedure } from '../schemas';

export interface ValidProcedureService {
  getDetail(id: string): Promise<Procedure>;
}
