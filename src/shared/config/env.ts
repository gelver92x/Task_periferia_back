import dotenv from 'dotenv';

dotenv.config();

const parseAllowedOrigins = (value?: string): string[] => {
  if (!value) {
    return ['http://localhost:4200'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = {
  port: Number(process.env.PORT ?? 3000),
  dbPath: process.env.DB_PATH ?? './data/tasks.db',
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
};

