export const EnvConfiguration = () => ({
  enviroment: process.env.NODE_ENV,
  mongodb: process.env.MONGODB,
  port: +process.env.PORT,
});
