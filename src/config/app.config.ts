import { getEnv } from '../cummon/utils/get-env';

const appConfig = () => ({
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  APP_ORIGIN: getEnv('APP_ORIGIN', 'localhost'),
  PORT: getEnv('PORT', '5000'),
  BASE_PATH: getEnv('BASE_PATH', '/api/v1'),
  JWT: {
    SECRET: getEnv('JWT_SECRET'),
    EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '1m'),
    REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
    REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '30d'),
  },
  CRYPTO: {
    SECRET: getEnv('CRYPTO_SECRET'),
  },
  MAILER_SENDER: getEnv('MAILER_SENDER'),
  RESEND_API_KEY: getEnv('RESEND_API_KEY'),
  DATABASE_URL: getEnv('DATABASE_URL'),
  CLOUDINARY_CLOUD: {
    NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
    API_KEY: getEnv('CLOUDINARY_CLOUD_API_KEY'),
    API_SECRET: getEnv('CLOUDINARY_CLOUD_API_SECRET'),
  },
  MIDTRANS: {
    CLIENT_KEY: getEnv('MIDTRANS_CLIENT_KEY'),
    SERVER_KEY: getEnv('MIDTRANS_SERVER_KEY'),
    TRANSACTION_URL: getEnv('MIDTRANS_TRANSACTION_URL'),
  },
});

export const config = appConfig();
