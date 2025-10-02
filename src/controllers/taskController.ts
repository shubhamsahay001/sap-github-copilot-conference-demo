import { Request, Response } from 'express';

import type { CreateTaskDTO, TaskPriority, TaskStatus, UpdateTaskDTO } from '../models/task';
import { taskRepository } from '../repositories/taskRepository';

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
const STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'archived'];

const sanitizeString = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback;
  return value.trim();
};

const parseDate = (value: unknown): string | null => {
  if (value === null) return null;
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : value;
};

const validateTaskPayload = (payload: Partial<CreateTaskDTO | UpdateTaskDTO>) => {
  const errors: string[] = [];

  if ('title' in payload && typeof payload.title !== 'undefined') {
    if (sanitizeString(payload.title).length === 0) {
      errors.push('Title must not be empty.');
    }
  }

  if ('priority' in payload && payload.priority) {
    if (!PRIORITIES.includes(payload.priority)) {
      errors.push(`Priority must be one of: ${PRIORITIES.join(', ')}.`);
    }
  }

  if ('status' in payload && payload.status) {
    if (!STATUSES.includes(payload.status)) {
      errors.push(`Status must be one of: ${STATUSES.join(', ')}.`);
    }
  }

  if ('dueDate' in payload) {
    if (payload.dueDate && !parseDate(payload.dueDate)) {
      errors.push('Due date must be a valid date (YYYY-MM-DD).');
    }
  }

  return errors;
};

export const taskController = {
  list: (_req: Request, res: Response) => {
    const tasks = taskRepository.findAll();
    res.json({
      success: true,
      data: tasks,
    });
  },

  getById: (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Task ID must be a number.' });
    }

    const task = taskRepository.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    return res.json({ success: true, data: task });
  },

  create: (req: Request, res: Response) => {
    const payload: CreateTaskDTO = {
      title: sanitizeString(req.body.title),
      description: sanitizeString(req.body.description ?? ''),
      priority: req.body.priority,
      status: req.body.status,
      category: sanitizeString(req.body.category ?? 'general'),
      dueDate: parseDate(req.body.dueDate),
    };

    if (!payload.title) {
      return res.status(400).json({ success: false, error: 'Title is required.' });
    }

    const errors = validateTaskPayload(payload);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors });
    }

    const task = taskRepository.create(payload);
    return res.status(201).json({ success: true, data: task });
  },

  update: (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Task ID must be a number.' });
    }

    const payload: UpdateTaskDTO = {
      title: typeof req.body.title === 'undefined' ? undefined : sanitizeString(req.body.title),
      description:
        typeof req.body.description === 'undefined'
          ? undefined
          : sanitizeString(req.body.description),
      priority: req.body.priority,
      status: req.body.status,
      category:
        typeof req.body.category === 'undefined'
          ? undefined
          : sanitizeString(req.body.category ?? ''),
      dueDate: req.body.dueDate === null ? null : parseDate(req.body.dueDate ?? undefined),
    };

    const errors = validateTaskPayload(payload);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors });
    }

    const task = taskRepository.update(id, payload);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    return res.json({ success: true, data: task });
  },

  remove: (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Task ID must be a number.' });
    }

    const removed = taskRepository.remove(id);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Task not found.' });
    }

    return res.status(204).send();
  },
};
