import { Router } from 'express';

import { taskController } from '../controllers/taskController';

const router = Router();

router.get('/', taskController.list);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.remove);

export const taskRoutes = router;
