import { Request, Response } from 'express'
import { formError } from '../helpers/errorFactory.js';
import { clearJwtCookies, setCSRFcookies, setJwtTokensAsHttpOnlyCookies } from '../utils/cookies.js';
import { checkIfUserAlreadyRegistered, saveEmailVerificationTokenService, saveUserSignUpCredentialsService, userVerificationService } from '../services/registration.js';
import { generateRandomTokenService, hashDataWithSaltService } from '../services/hashing.js';
import { sendEmailVerificationService } from '../services/mailService.js';

export async function localStrategyController(request: Request, response: Response): Promise<void> {
    try {
        const email = request.body.email as string;
        const username = request.body.username as string;
        const firstname = request.body.firstname as string;
        const lastname = request.body.lastname as string;
        const password = request.body.password as string;

        clearJwtCookies(response);

        // checking if the username or the email is already taken (returns the reserved field)
        const field = await checkIfUserAlreadyRegistered(email, username);

        if (field === 'email') {
            response.status(400).send( formError('email', 'Please use a different email address') );
            return ;
        }

        if (field === 'username') {
            response.status(400).send( formError('username', 'Please use a different username') );
            return ;
        }

        // hash password with salt and save user credentials
        const [hashedPassword, salt] = await hashDataWithSaltService(password);

        const userId = await saveUserSignUpCredentialsService(email, username, firstname, lastname, hashedPassword, salt);

        const verificationToken = generateRandomTokenService(16);

        // wait until the token is stored
        await saveEmailVerificationTokenService(verificationToken, userId);

        // send email verification without blocking the user
        sendEmailVerificationService(email, firstname, verificationToken).catch(err => {
            // console.log('error sending the verification email!');
        });

        response.status(201).send( { msg: 'Registration successful. Please check your email to verify your account.' } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function emailVerficiationController(request: Request, response: Response): Promise<void> {
    try {
        // the token is already checked in the previous middleware
        const authHeader = request.headers['authorization'] as string;
        const token = authHeader.split(' ')[1] as string;

        // verifying the token, if it exists it will be deleted (consumed)
        const userId = await userVerificationService(token);

        if (userId == undefined) {
            // console.log('user not verified');
            response.status(403).send( { msg: 'token not found or expired!' } );
            return ;
        }

        // set jwt tokens in httpOnly cookies to mitigate XSS attacks
        setJwtTokensAsHttpOnlyCookies(userId, response);

        // set CSRF cookies to mitigate CSRF attacks
        setCSRFcookies(response);

        // console.log('user verified successfully');

        response.sendStatus(201);
    }
    catch (err) {
        response.status(500).send( { err: 'verification failed!' } );
    }
}
