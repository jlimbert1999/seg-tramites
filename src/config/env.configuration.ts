export const EnvConfiguration = () => ({
  port: parseInt(process.env.PORT) || 3000,
  mongodb_url: process.env.MONGODB_URL,
  year: process.env.YEAR,
});
