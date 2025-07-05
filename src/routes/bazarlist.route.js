import express from 'express';
import { createBazarlist, getBazarlist } from '../controllers/bazarlist.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { generateMonthlySummery } from '../controllers/summery.controller.js';
const router = express.Router();

router.post('/bazarlist/create', verifyJWT, createBazarlist);
router.get('/bazarlist', verifyJWT, getBazarlist);
router.put('/summery',generateMonthlySummery);
export default router;