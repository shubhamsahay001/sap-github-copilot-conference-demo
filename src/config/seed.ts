import { db, runMigrations } from './database';

runMigrations();

const clearStmt = db.prepare('DELETE FROM tasks');
const insertStmt = db.prepare(
  `INSERT INTO tasks (title, description, priority, status, category, due_date)
   VALUES (@title, @description, @priority, @status, @category, @dueDate)`
);

const sampleTasks = [
  {
    title: 'Prepare Q4 Planning Workshop',
    description:
      'Coordinate with department leads to define agenda and collect required materials for the upcoming planning workshop.',
    priority: 'high',
    status: 'in_progress',
    category: 'workshop',
    dueDate: '2025-10-15',
  },
  {
    title: 'Review SAP Fiori Guidelines',
    description: 'Ensure front-end design complies with the latest SAP Fiori UX recommendations.',
    priority: 'medium',
    status: 'pending',
    category: 'design',
    dueDate: '2025-10-10',
  },
  {
    title: 'Finalize Demo Script',
    description: 'Polish the narrative for the GitHub Copilot code review session.',
    priority: 'critical',
    status: 'pending',
    category: 'presentation',
    dueDate: '2025-10-05',
  },
];

const seed = () => {
  clearStmt.run();
  const insertMany = db.transaction((rows: typeof sampleTasks) => {
    rows.forEach((row) => insertStmt.run(row));
  });
  insertMany(sampleTasks);
};

seed();

console.log('Seed data inserted successfully.');
