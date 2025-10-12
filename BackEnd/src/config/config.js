import dotenv from 'dotenv'
dotenv.config()

export const config = {
    // Server configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
      // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'unasecretamuylarga',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    
    // Email configuration (Resend)
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      // Database configuration (Turso)
    TURSO_DATABASE_URL: process.env.TURSO_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    
    // CORS configuration
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    
    // File upload configuration
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '50mb',
    
    // Socket.IO configuration
    SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || '*'
};

export default config;


