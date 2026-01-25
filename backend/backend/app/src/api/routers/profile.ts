import { Router } from "express";
import {
    blockUserController,
    getBriefProfileInfoController,
    getCurrProfileInfoController,
    getCurrBriefProfileInfoController,
    getProfileInfoController,
    likeProfileController,
    reportFakeAccountController,
    unlikeProfileController,
    updateInterestsController,
    updatePersonalInfoController,
    storeUserLocation,
    addPhotosController,
    removePhotoController
} from "../controllers/profile.js";
import { blockMiddleware, validateUserIdParam, validStoreUserLocation } from "../middlewares/profile.js";
import { validateJwtToken, validateCSRFCookies } from "../middlewares/authorization.js";
import { validateCompleteProfileBody } from "../middlewares/complete-info.js";
import upload from "../middlewares/upload.js";
import { multerErrorHandler } from "../middlewares/multerErrorHandler.js";

const router = Router();

router.use(validateJwtToken);
router.use(validateCSRFCookies);

router.get('/profileInfo/:userId', validateUserIdParam, blockMiddleware, getProfileInfoController);
router.get('/currUserProfileInfo', getCurrProfileInfoController);
router.get('/currUserBriefProfileInfo', getCurrBriefProfileInfoController);
router.get('/briefProfileInfo/:userId', validateUserIdParam, blockMiddleware, getBriefProfileInfoController);
router.patch('/profileInterests', updateInterestsController);
router.post('/block/:userId', validateUserIdParam, blockMiddleware, blockUserController);
router.post('/reportFakeAccount/:userId', validateUserIdParam, blockMiddleware, reportFakeAccountController);
router.post('/likeProfile/:userId', validateUserIdParam, blockMiddleware, likeProfileController);
router.post('/unlikeProfile/:userId', validateUserIdParam, blockMiddleware, unlikeProfileController);
router.post('/updatePersonalInfo', upload.single('profilePicture'), multerErrorHandler, validateCompleteProfileBody, updatePersonalInfoController);
router.post('/addPhotos', upload.array('image', 4), multerErrorHandler, addPhotosController);
router.delete('/removePhoto', removePhotoController);
router.post("/send-location", validStoreUserLocation, storeUserLocation)

export default router;