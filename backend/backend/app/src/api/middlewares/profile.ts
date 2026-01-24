import { Request, Response, NextFunction } from 'express'
import { isBlockedService } from '../services/profile.js';
import { isIdValid } from '../validators/generalValidators.js';

export function validateUserIdParam(request: Request, response: Response, next: NextFunction) {
    const { userId } = request.params;

    if (!userId || typeof userId != 'string' || !isIdValid(userId)) {
        response.status(400).send( { msg: 'invalid userId' } );
        return ;
    }

    next();
}

export async function blockMiddleware(request: Request, response: Response, next: NextFunction) {
    const userId = request.user.id;

    const visitedUserId = Number(request.params.userId);

    if (typeof visitedUserId !== 'number') {
        response.sendStatus(400);
        return ;
    }

    if (await isBlockedService(userId as number, visitedUserId) === true
        || await isBlockedService(visitedUserId, userId as number) === true) {
        response.status(403).send( { url: process.env.FRONTEND_PROFILE_URL
 } );
        return ;
    }

    next();
}

export async function validStoreUserLocation(request: Request, response: Response, next: NextFunction) {
    const { longitude, latitude } = request.body;

    if (
        typeof longitude !== "number" ||
        typeof latitude !== "number" ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude)
    ) {
        response.status(400).json({ error: "Invalid latitude or longitude type" });
        return;
    }

    // geographic constraints
    if (
        latitude < -90 || latitude > 90 ||
        longitude < -180 || longitude > 180
    ) {
        response.status(400).json({ error: "Latitude or longitude out of range" });
        return;
    }

    next();
}
