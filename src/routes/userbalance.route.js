import express from 'express';
import { addBalance } from '../controllers/userbalance.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Add balance route
router.put('/addbalance', verifyJWT, addBalance);

export default router;
