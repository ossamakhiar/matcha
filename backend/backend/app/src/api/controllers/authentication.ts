import { Request, Response } from 'express'
import { clearAllCookies, setCSRFcookies, setCompleteProfileInfoCookie, setJwtTokensAsHttpOnlyCookies } from '../utils/cookies.js';
import { changePasswordService, emailValidationService, loginVerificationService, saveResetPasswordTokenService } from '../services/authentication.js';
import { generateRandomTokenService } from '../services/hashing.js';
import { sendForgetPasswordEmailService } from '../services/mailService.js';
import { CompleteProfileNextStep } from '../types/enums.js';

export async function localStrategyController(request: Request, response: Response): Promise<void> {
    try {
        // console.log('login controller ....')
        const username = request.body.username as string;
        const password = request.body.password as string;
        const [userId, is_profile_complete] = await loginVerificationService(username, password);

        if (!userId) {
            response.status(403).send( { msg: 'invalid username or password' } );
            return ;
        }

        // set jwt tokens in httpOnly cookies to mitigate XSS attacks
        setJwtTokensAsHttpOnlyCookies(userId as number, response);

        // set profile as already complete
        if (is_profile_complete) {
            setCompleteProfileInfoCookie(CompleteProfileNextStep.DONE, response);
        }

        // set CSRF cookies to mitigate CSRF attacks
        setCSRFcookies(response);

        response.status(201).send( { msg: 'logged in successfully' } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function forgetPasswordController(request: Request, response: Response): Promise<void> {
    try {
        const email = request.body.email as string;

        const userId = await emailValidationService(email);

        if (!userId) {
            response.status(403).send( { msg: 'invalid email address' } );
            return ;
        }

        const resetToken = generateRandomTokenService(16);
        await saveResetPasswordTokenService(userId as number, resetToken);
        sendForgetPasswordEmailService(email, resetToken);

        response.status(201).send( { msg: 'email sent' } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function resetPasswordController(request: Request, response: Response) {
    try {
        const authHeader = request.headers['authorization'] as string;
        const resetToken = authHeader.split(' ')[1] as string;
        const password = request.body.password as string;

        const userId = await changePasswordService(resetToken, password);

        if (userId === undefined) {
            response.status(403).send( { msg: 'resetToken invalid or expired' } );
            return ;
        }

        response.status(201).send( { msg: 'password changed!' } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function logoutUserController(request: Request, response: Response) {
    clearAllCookies(response);
    response.status(201).send( { msg: 'logged out' } );
}
