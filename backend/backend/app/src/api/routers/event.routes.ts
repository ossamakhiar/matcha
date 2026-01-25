import { Router } from "express";
import { getEventsController, updateEventController } from "../controllers/event.controller.js";

const router = Router();

router.get('/events', getEventsController);
router.patch('/events/:eventId', updateEventController);

export default router;
