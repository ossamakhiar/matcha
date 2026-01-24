import { Router } from "express";
import passport from 'passport'
import { discordCallbackController } from "../controllers/oauth.js";

const router = Router();

router.get('/auth/discord', (req, res, next) => {
    // console.log('Redirecting to Discord');
    next();
}, passport.authenticate('discord'));

router.get('/auth/discord/callback', (req, res, next) => {
        // console.log('Redirecting to callback');
        next();
    },
    passport.authenticate('discord', { session: false }),
    discordCallbackController
);

export default router;