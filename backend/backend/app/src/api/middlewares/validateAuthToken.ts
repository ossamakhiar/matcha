import { Request, Response, NextFunction } from "express";
import { extractAuthTokenService } from "../services/authToken.js";

export function validateAuthToken(request: Request, response: Response, next: NextFunction) {
    const authHeader = request.headers['authorization'];
    const token = extractAuthTokenService(authHeader);

    if (!token) {
        // console.log('auth middleware failed!');
        response.status(400).send( { msg: 'invalid or missing token' } );
    }
    // console.log('auth middleware passed!');
    next();
}
