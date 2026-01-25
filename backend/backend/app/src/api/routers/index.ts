import { Router } from "express";
import authenticationRouter from './authentication.js'
import registrationRouter from './registration.js'
import protectedRouter from './protectedRoutes.js'
import profileRouter from './profile.js'
import completeProfileRouter from './complete-profile.js'
import exploreRouter from './explore.js'
import searchRouter from './search.js'
import oauthRouter from './oauth.js'
import historyRouter from './history.js'
import eventRouter from './event.routes.js'

const router = Router();

router.use(authenticationRouter);
router.use(registrationRouter);

router.use(oauthRouter);
router.use(profileRouter);
router.use(protectedRouter);
router.use(completeProfileRouter);
router.use(exploreRouter);

router.use(searchRouter)
router.use(historyRouter);
router.use(eventRouter);

export default router;