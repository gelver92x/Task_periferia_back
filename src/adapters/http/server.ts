import { env } from '../../shared/config/env';
import { createApp } from './app';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});

