import { JwtPayload } from 'src/modules/auth/interfaces';

export interface userSocket extends JwtPayload {
  socketIds: string[];
}
