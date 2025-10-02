import request from 'supertest';

import { resetDatabase } from '../config/database';
import { taskRepository } from '../repositories/taskRepository';
import { app } from '../server';

describe('Task routes', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('returns all tasks', async () => {
    taskRepository.create({
      title: 'Test task',
      description: 'Ensure API returns data',
      priority: 'high',
      category: 'quality',
      status: 'pending',
    });

    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('creates a new task', async () => {
    const payload = {
      title: 'Implement CI pipeline',
      description: 'Configure GitHub Actions for linting and tests',
      priority: 'medium',
      status: 'pending',
      category: 'devops',
    };

    const response = await request(app).post('/api/tasks').send(payload);

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe(payload.title);
    expect(response.body.data.id).toBeDefined();
  });
});
