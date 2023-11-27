import { EnvConfig } from 'src/auth/interfaces';

export const EnvConfiguration = (): EnvConfig => ({
  mongodb_url: process.env.MONGODB_URL,
  jwt_key: process.env.JWT_KEY,
  id_root: process.env.ID_ROOT,
  port: parseInt(process.env.PORT) || 3000,
  year: +process.env.YEAR,
});
