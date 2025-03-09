import { Router } from 'express';
const router = Router();

import apiRoutes from './api/index.js';
import htmlRoutes from './htmlRoutes.js';

router.use(apiRoutes);
router.use('/', htmlRoutes);

export default router;
