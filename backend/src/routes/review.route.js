// Main: review routes.
import { Router } from "express";
import { addReview, getProviderReviews } from "../controllers/review.controller.js";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyToken, authorizeRoles("user"), addReview);
router.get("/:providerId", getProviderReviews);

export default router;
