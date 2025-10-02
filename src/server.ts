import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { runMigrations } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { taskRoutes } from './routes/taskRoutes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

runMigrations();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use('/api/tasks', taskRoutes);

const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SAP Task Planner listening on http://localhost:${PORT}`);
  });
}

export { app };
