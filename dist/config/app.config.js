"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const get_env_1 = require("../cummon/utils/get-env");
const appConfig = () => ({
    NODE_ENV: (0, get_env_1.getEnv)('NODE_ENV', 'development'),
    APP_ORIGIN: (0, get_env_1.getEnv)('APP_ORIGIN', 'localhost'),
    PORT: (0, get_env_1.getEnv)('PORT', '5000'),
    BASE_PATH: (0, get_env_1.getEnv)('BASE_PATH', '/api/v1'),
    JWT: {
        SECRET: (0, get_env_1.getEnv)('JWT_SECRET'),
        EXPIRES_IN: (0, get_env_1.getEnv)('JWT_EXPIRES_IN', '1m'),
        REFRESH_SECRET: (0, get_env_1.getEnv)('JWT_REFRESH_SECRET'),
        REFRESH_EXPIRES_IN: (0, get_env_1.getEnv)('JWT_REFRESH_EXPIRES_IN', '30d'),
    },
    CRYPTO: {
        SECRET: (0, get_env_1.getEnv)('CRYPTO_SECRET'),
    },
    MAILER_SENDER: (0, get_env_1.getEnv)('MAILER_SENDER'),
    RESEND_API_KEY: (0, get_env_1.getEnv)('RESEND_API_KEY'),
    DATABASE_URL: (0, get_env_1.getEnv)('DATABASE_URL'),
    CLOUDINARY_CLOUD: {
        NAME: (0, get_env_1.getEnv)('CLOUDINARY_CLOUD_NAME'),
        API_KEY: (0, get_env_1.getEnv)('CLOUDINARY_CLOUD_API_KEY'),
        API_SECRET: (0, get_env_1.getEnv)('CLOUDINARY_CLOUD_API_SECRET'),
    },
    MIDTRANS: {
        CLIENT_KEY: (0, get_env_1.getEnv)('MIDTRANS_CLIENT_KEY'),
        SERVER_KEY: (0, get_env_1.getEnv)('MIDTRANS_SERVER_KEY'),
        TRANSACTION_URL: (0, get_env_1.getEnv)('MIDTRANS_TRANSACTION_URL'),
        FINISH_REDIRECT_URL: (0, get_env_1.getEnv)('FINISH_REDIRECT_URL', 'https://frontend-event-two.vercel.app/payment/success'),
    },
});
exports.config = appConfig();
