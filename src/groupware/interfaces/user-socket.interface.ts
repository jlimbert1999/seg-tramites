import { JwtPayload } from 'src/auth/interfaces';

export interface userSocket extends JwtPayload {
  socketIds: string[];
}
