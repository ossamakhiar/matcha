import { Router } from "express";
import { validateCSRFCookies, validateJwtToken } from "../middlewares/authorization.js";
import { completeInterestsController, completePersonalInfoController, completePhotosController } from "../controllers/complete-profile.js";
import upload from "../middlewares/upload.js";
import { checkIfAlreadyCompleted, validateCompleteProfileBody } from "../middlewares/complete-info.js";
import { multerErrorHandler } from "../middlewares/multerErrorHandler.js";

const router = Router();

router.use(validateJwtToken);
router.use(validateCSRFCookies);
router.use(checkIfAlreadyCompleted);

router.post('/completeprofileInterests', completeInterestsController);
router.post('/completeProfilePhotos', upload.array('image'), multerErrorHandler, completePhotosController);
router.post('/completePersonalInfo', upload.single('profilePicture'), multerErrorHandler, validateCompleteProfileBody, completePersonalInfoController);

export default router;
