// Main: public provider listing routes.
import { Router } from "express";
import { getallServiceProvides } from "../controllers/getProvider.controller.js";

const router = Router();

router.route('/provider').get(getallServiceProvides)

export default router;