import { db } from '../config/database';
import type { CreateTaskDTO, Task, TaskStatus, UpdateTaskDTO } from '../models/task';

type TaskRecord = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

const mapTask = (record: TaskRecord): Task => ({
  id: record.id,
  title: record.title,
  description: record.description,
  priority: record.priority as Task['priority'],
  status: record.status as TaskStatus,
  category: record.category,
  dueDate: record.due_date,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

const selectAll = db.prepare(`
  SELECT id, title, description, priority, status, category, due_date, created_at, updated_at
  FROM tasks
  ORDER BY created_at DESC
`);

const selectById = db.prepare(`
  SELECT id, title, description, priority, status, category, due_date, created_at, updated_at
  FROM tasks
  WHERE id = ?
`);

const insertTask = db.prepare(`
  INSERT INTO tasks (title, description, priority, status, category, due_date)
  VALUES (@title, @description, @priority, @status, @category, @dueDate)
`);

const updateTaskStmt = db.prepare(`
  UPDATE tasks
  SET
    title = COALESCE(@title, title),
    description = COALESCE(@description, description),
    priority = COALESCE(@priority, priority),
    status = COALESCE(@status, status),
    category = COALESCE(@category, category),
    due_date = CASE
      WHEN @dueDate = '__NULL__' THEN NULL
      ELSE COALESCE(@dueDate, due_date)
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = @id
`);

const deleteTaskStmt = db.prepare('DELETE FROM tasks WHERE id = ?');

export const taskRepository = {
  findAll(): Task[] {
    const rows = selectAll.all() as TaskRecord[];
    return rows.map(mapTask);
  },
  findById(id: number): Task | null {
    const row = selectById.get(id) as TaskRecord | undefined;
    return row ? mapTask(row) : null;
  },
  create(payload: CreateTaskDTO): Task {
    const info = insertTask.run({
      title: payload.title,
      description: payload.description ?? '',
      priority: payload.priority ?? 'medium',
      status: payload.status ?? 'pending',
      category: payload.category ?? 'general',
      dueDate: payload.dueDate ?? null,
    });

    const created = selectById.get(info.lastInsertRowid) as TaskRecord;
    return mapTask(created);
  },
  update(id: number, payload: UpdateTaskDTO): Task | null {
    const result = updateTaskStmt.run({
      id,
      title: payload.title ?? null,
      description: payload.description ?? null,
      priority: payload.priority ?? null,
      status: payload.status ?? null,
      category: payload.category ?? null,
      dueDate: payload.dueDate === null ? '__NULL__' : payload.dueDate ?? null,
    });

    if (result.changes === 0) {
      return null;
    }

    const updated = selectById.get(id) as TaskRecord;
    return mapTask(updated);
  },
  remove(id: number): boolean {
    const result = deleteTaskStmt.run(id);
    return result.changes > 0;
  },
};
