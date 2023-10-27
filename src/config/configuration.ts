export const EnvConfiguration = () => ({
  port: parseInt(process.env.PORT) || 3000,
  database: process.env.MONGODB_URL,
});
