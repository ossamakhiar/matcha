import { Request, Response } from 'express'
import dotenv from 'dotenv'
import { setCSRFcookies, setCompleteProfileInfoCookie, setJwtTokensAsHttpOnlyCookies } from '../utils/cookies.js';
import { isProfileComplete } from '../services/oauth.js';
import { CompleteProfileNextStep } from '../types/enums.js';

dotenv.config();

export async function discordCallbackController(request: Request, response: Response) {
    if (request.user && typeof request.user == 'number') {
        // console.log(`requestCallbackUserId: ${request.user}`);
        // set jwt tokens in httpOnly cookies to mitigate XSS attacks
        setJwtTokensAsHttpOnlyCookies(request.user as number, response);

        // set CSRF cookies to mitigate CSRF attacks
        setCSRFcookies(response);

        const is_profile_complete = await isProfileComplete(request.user);

        // set profile as already complete
        if (is_profile_complete) {
            setCompleteProfileInfoCookie(CompleteProfileNextStep.DONE, response);
        }
    }

    response.redirect(process.env.FRONTEND_PROFILE_URL as string);
}
