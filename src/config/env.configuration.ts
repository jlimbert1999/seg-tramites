import { EnvConfig } from 'src/modules/auth/interfaces';

export const EnvConfiguration = (): EnvConfig => ({
  mongodb_url: process.env.MONGODB_URL,
  jwt_key: process.env.JWT_KEY,
  id_root: process.env.ID_ROOT,
  port: parseInt(process.env.PORT) || 3000,
  year: +process.env.YEAR,
  jwt_public_key: process.env.JWT_PUBLIC_KEY,
  host: process.env.HOST,
});
