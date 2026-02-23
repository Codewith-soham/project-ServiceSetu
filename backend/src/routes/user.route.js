// Main: user profile routes.
import { Router } from 'express';
import { authorizeRoles, verifyToken } from '../middlewares/auth.middleware.js';
import { getCurrentUserProfile, updateUserProfile, changeUserPassword } from '../controllers/user.controller.js';

const router = Router();

router.route('/profile').get(verifyToken, authorizeRoles("user", "provider", "admin"), getCurrentUserProfile)
router.route('/profile/update').put(verifyToken, authorizeRoles("user", "provider", "admin"), updateUserProfile)
router.route('/change-password').put(verifyToken, authorizeRoles("user", "provider", "admin"), changeUserPassword)

export default router;