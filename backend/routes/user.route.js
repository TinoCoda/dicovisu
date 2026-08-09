import express from 'express';
import { getAllUsers,createUser, updateUser,deleteUser } from '../controllers/user.controller.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { verifyRoles } from '../middleware/verifyRoles.js';
import registerLimiter from '../middleware/registerLimiter.js';
const router = express.Router();

// Self-registration stays public — this is the app's Sign Up flow.
router.post('/register', registerLimiter, createUser);

// Everything else manages OTHER users' accounts (list, edit, delete) and
// must never be reachable without being logged in as an admin.
router.use(verifyJWT, verifyRoles('superadmin'));
router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);


export default router;