import cors from 'cors';
import express from 'express';

import { env } from '../../shared/config/env';
import { createTaskRouter } from './routes/task.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.allowedOrigins,
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });

  app.use('/tasks', createTaskRouter());
  app.use(errorMiddleware);

  return app;
};

