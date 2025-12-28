import { Request, Response } from 'express'
import { likeProfileService, blockUserService, reportFakeAccountService, getBriefProfileInfosService, getProfileInfosService, updateUserInterestsService, unlikeProfileService, addUserInterestsService } from '../services/profile.js';
import { getUserIdFromJwtService } from '../services/jwt.js';
import { updatePersonalInfosService, updateUserLocation } from '../services/complete-profile.js';
import { isArray } from '../validators/generalPurpose.js';
import { getHttpError } from '../helpers/getErrorObject.js';

export async function getProfileInfosController(request: Request, response: Response) {
    const profileId = Number(request.params.userId);
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);

    try {
        const profileInfos = await getProfileInfosService(profileId, userId as number);

        if (!profileInfos) {
            response.status(404).send( { msg: 'user not found' } );
            return ;
        }

        response.status(200).send( { profileInfos } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function getCurrProfileInfosController(request: Request, response: Response) {
    try {
        const accessToken = request.cookies['AccessToken'] as string;
        const { userId } = getUserIdFromJwtService(accessToken);
        const profileInfos = await getProfileInfosService(userId as number, userId as number);

        if (!profileInfos) {
            response.status(404).send( { msg: 'user not found' } );
            return ;
        }

        response.status(200).send( { profileInfos } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function getBriefProfileInfosController(request: Request, response: Response) {
    try {
        const userId = Number(request.params.userId);
        const profileInfos = await getBriefProfileInfosService(userId);

        if (!profileInfos) {
            response.status(404).send( { msg: 'user not found' } );
            return ;
        }

        response.status(200).send( { profileInfos } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function getCurrBriefProfileInfosController(request: Request, response: Response) {
    try {
        const accessToken = request.cookies['AccessToken'] as string;
        const { userId } = getUserIdFromJwtService(accessToken);

        const profileInfos = await getBriefProfileInfosService(userId as number);

        console.log('userId: ' + userId);

        if (!profileInfos) {
            response.status(404).send( { msg: 'user not found' } );
            return ;
        }

        response.status(200).send( { profileInfos } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function updateInterestsController(request: Request, response: Response) {
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);
    const { interests } = request.body;

    if (!isArray(interests, undefined, 'string')) {
        response.status(400).send( { msg: 'bad interests request body' } );
        return ;
    }

    // console.log(`fine: ${interests}`);

    try {
        await updateUserInterestsService(userId as number, interests);
        response.sendStatus(200);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function addInterestsController(request: Request, response: Response) {
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);
    const { interests } = request.body;

    if (!isArray(interests, undefined, 'string')) {
        response.status(400).send( { msg: 'bad interests request body' } );
        return ;
    }

    // console.log(`fine: ${interests}`);

    try {
        await addUserInterestsService(userId as number, interests);
        response.sendStatus(200);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function blockUserController(request: Request, response: Response) {
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);
    const blockedUserId = Number(request.params.userId);

    // console.log('BlockingUserId: ' + userId);
    // console.log('BlockedUserId: ' + blockedUserId);

    if (userId === blockedUserId) {
        response.sendStatus(400);
        return ;
    }

    try {
        await blockUserService(userId as number, blockedUserId);

        response.sendStatus(201);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function reportFakeAccountController(request: Request, response: Response) {
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);
    const reportedUserId = Number(request.params.userId);

    if (userId === reportedUserId) {
        response.sendStatus(400);
        return ;
    }

    // console.log('reportingUserId: ' + userId);
    // console.log('reportedUserId: ' + reportedUserId);

    try {
        await reportFakeAccountService(userId as number, reportedUserId);

        response.sendStatus(201);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function likeProfileController(request: Request, response: Response) {
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);
    const likedUserId = Number(request.params.userId);

    if (userId === likedUserId) {
        console.log('bad like request');
        response.sendStatus(400);
        return ;
    }    

    try {
        await likeProfileService(userId as number, likedUserId);

        response.sendStatus(201);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function unlikeProfileController(request: Request, response: Response) {
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);
    const unlikedUserId = Number(request.params.userId);

    // console.log('unlikingUserId: ' + userId);
    // console.log('unlikedUserId: ' + unlikedUserId);

    if (userId === unlikedUserId) {
        response.sendStatus(400);
        return ;
    }

    try {
        await unlikeProfileService(userId as number, unlikedUserId);

        response.sendStatus(201);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function updatePersonalInfosController(request: Request, response: Response) {
    const file = request.file as Express.Multer.File;

    let profilePicturePath = null;
    const username = request.body.username as string;
    const firstname = request.body.firstname as string;
    const lastname = request.body.lastname as string;
    const gender = request.body.gender as string;
    const age = Number(request.body.age as string);
    const biography = request.body.biography as string;
    const sexualPreference = request.body.sexualPreference as string;
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);

    if (file) {
        profilePicturePath = file.path;
    }

    try {
        const personalInfos = {profilePicturePath, username, firstname, lastname, age, gender, sexualPreference, biography}
        const imageUrl = await updatePersonalInfosService(userId as number, personalInfos);

        response.status(201).send( { msg: 'personal infos completed!', imageUrl } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}



export async function storeUserLocation(request: Request, response: Response) {
    const userId = request.user.id;
    // TODO : add an indicator when the user denied, to use an IP geolocation fallback
    // const {longitude, latitude} = request.body.coords;

    // console.log(`longitude: ${longitude}; latitude: ${latitude}`)
    console.log(request.body)
    try {
        await updateUserLocation(userId, request.body);
        response.sendStatus(200);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}
