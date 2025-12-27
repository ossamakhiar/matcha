import { Request, Response, NextFunction } from 'express'
import { isEmailFormatValid, isPasswordValid, isUsernameValid } from '../validators/userCredentials.js';
import dotenv from 'dotenv'

dotenv.config();

export function validateLocalLoginBody(request: Request, response: Response, next: NextFunction): void {
    const { username, password } = request.body;
    const error = 'invalid username or password';

    if (!username || !password) {
        response.status(400).send({ msg: error });
        return;
    }

    if (typeof username != 'string' || typeof password != 'string') {
        response.status(400).send({ msg: error });
        return;
    }

    if (!isPasswordValid(password).status || !isUsernameValid(username)) {
        response.status(400).send({ msg: error });
        return;
    }

    next();
}

export function validateForgotPassword(request: Request, response: Response, next: NextFunction) {
    const { email } = request.body;

    if (!email || !isEmailFormatValid(email)) {
        response.status(400).send({ msg: 'missing email or invalid email format' });
        return;
    }

    next();
}

export function validateResetPassword(request: Request, response: Response, next: NextFunction) {
    const { password } = request.body;

    if (!password || !isPasswordValid(password as string).status) {
        response.status(400).send({ msg: 'missing or invalid password' });
        return;
    }

    next();
}
