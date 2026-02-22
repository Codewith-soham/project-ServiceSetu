import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { getCurrentUserProfile, updateUserProfile, changeUserPassword } from '../controllers/user.controller.js';

const router = Router();

router.route('/profile').get(verifyToken, getCurrentUserProfile)
router.route('/profile/update').put(verifyToken, updateUserProfile)
router.route('/change-password').put(verifyToken, changeUserPassword)

export default router;