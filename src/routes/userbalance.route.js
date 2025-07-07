import express from 'express';
import { addBalance, getAlluserCurrentBalanceCurrentMonth, getBalance, approvePendingDeposit,getPendingDeposits, } from '../controllers/userbalance.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isManager } from '../middlewares/manager.middleware.js';
import { deleteUser, removeManager, setManager } from '../controllers/user.controller.js';

const router = express.Router();

// Add balance route
router.put('/addbalance', verifyJWT, addBalance);
router.get('/getbalance',verifyJWT,getBalance);
router.get('/allusercurrentbalance',getAlluserCurrentBalanceCurrentMonth);
router.post('/approve-pending-deposit/:depositId', isManager, approvePendingDeposit);
router.get('/pending-deposits', isManager,getPendingDeposits);


//!delete user
router.delete('/deleteuser/:userId',isManager,deleteUser)


//Update Manager 
router.patch('/setmanager/:userId',isManager,setManager)
router.patch('/removemanager/:userId/',isManager,removeManager);




export default router;
