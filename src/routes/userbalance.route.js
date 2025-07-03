import express from 'express';
import { addBalance, getBalance } from '../controllers/userbalance.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Add balance route
router.put('/addbalance', verifyJWT, addBalance);
router.get('/getbalance',verifyJWT,getBalance);

export default router;
