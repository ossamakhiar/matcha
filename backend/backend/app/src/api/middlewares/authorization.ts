import { Request, Response, NextFunction } from 'express'
import { clearAllCookies, setAccessTokensCookie } from '../utils/cookies.js';
import { validateJwtAccessTokenService, validateJwtRefreshTokenService } from '../services/jwt.js';
import { extractAuthTokenService } from '../services/authToken.js';

export function validateJwtToken(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const accessToken = request.cookies['AccessToken'];
    const refreshToken = request.cookies['RefreshToken'];

    if (!accessToken || !refreshToken || typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
        clearAllCookies(response);
        return response.status(401).send({ err: 'not authorized' });
    }

    const accessTokenResult = validateJwtAccessTokenService(accessToken);

    if (accessTokenResult.error === 'invalid token') {
        clearAllCookies(response);
        return response.status(401).send({ err: 'not authorized' });
    }

    let userId: number | null = accessTokenResult.userId ?? null;

    if (accessTokenResult.error === 'expired token') {
        const refreshResult = validateJwtRefreshTokenService(refreshToken);

        if (refreshResult.userId === null) {
            clearAllCookies(response);
            return response.status(401).send({ err: 'not authorized' });
        }

        userId = refreshResult.userId;
        setAccessTokensCookie(userId, response);
    }

    // final check (just to make sure userId is null even when code changes)
    if (userId === null) {
        clearAllCookies(response);
        return response.status(401).send({ err: 'not authorized' });
    }

    request.user = { id: userId };
    next();
}


export function validateCSRFCookies(request: Request, response: Response, next: NextFunction) {
    const secretCookie = request.cookies['csrfSecretCookie'];
    const authHeader = request.headers['authorization'];
    const clientAccessibleCookie = extractAuthTokenService(authHeader);

    if (!secretCookie || !clientAccessibleCookie
        || typeof secretCookie != 'string' || typeof clientAccessibleCookie != 'string') {
        clearAllCookies(response);
        // send a notification to warn the user of a csrf attack attempt

        response.status(401).send( { msg: 'not authorized' } );
        return ;
    }

    if (secretCookie != clientAccessibleCookie) {
        // send a notification to warn the user of a csrf attack attempt
        clearAllCookies(response);
        response.status(401).send( { msg: 'not authorized' } );
        return ;
    }

    // console.log('CSRF validated');
    next();
}
