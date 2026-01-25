import { Request, Response } from 'express'
import { likeProfileService, blockUserService, reportFakeAccountService, getBriefProfileInfoService, getProfileInfoService, updateUserInterestsService, unlikeProfileService, addUserInterestsService } from '../services/profile.js';
import { updatePersonalInfoService, updateUserLocation, getUserPhotoCount, addUserPhotosService, removeUserPhotoService } from '../services/complete-profile.js';
import { isArray } from '../validators/generalPurpose.js';
import { getHttpError } from '../helpers/getErrorObject.js';

export async function getProfileInfoController(request: Request, response: Response) {
    const profileId = Number(request.params.userId);
    const userId = request.user.id;


    try {
        const profileInfo = await getProfileInfoService(profileId, userId);

        if (!profileInfo) {
            response.status(404).send( { msg: 'user not found' } );
            return ;
        }

        response.status(200).send( { profileInfo } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function getCurrProfileInfoController(request: Request, response: Response) {
    try {
        const userId = request.user.id;
        const profileInfo = await getProfileInfoService(userId, userId);

        if (!profileInfo) {
            response.status(404).send( { msg: 'user not found' } );
            return ;
        }

        response.status(200).send( { profileInfo } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function getBriefProfileInfoController(request: Request, response: Response) {
    try {
        const userId = Number(request.params.userId);
        const profileInfo = await getBriefProfileInfoService(userId);

        if (!profileInfo) {
            response.status(404).send( { msg: 'user not found' } );
            return ;
        }

        response.status(200).send( { profileInfo } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function getCurrBriefProfileInfoController(request: Request, response: Response) {
    try {
        const userId = request.user.id;
        const profileInfo = await getBriefProfileInfoService(userId);

        if (!profileInfo) {
            response.status(404).send( { msg: 'user not found' } );
            return ;
        }

        response.status(200).send( { profileInfo } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function updateInterestsController(request: Request, response: Response) {
    const userId = request.user.id;

    const { interests } = request.body;

    if (!isArray(interests, undefined, 'string')) {
        response.status(400).send( { msg: 'bad interests request body' } );
        return ;
    }

    // console.log(`fine: ${interests}`);

    try {
        await updateUserInterestsService(userId, interests);
        response.sendStatus(200);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function addInterestsController(request: Request, response: Response) {
    const userId = request.user.id;

    const { interests } = request.body;

    if (!isArray(interests, undefined, 'string')) {
        response.status(400).send( { msg: 'bad interests request body' } );
        return ;
    }

    // console.log(`fine: ${interests}`);

    try {
        await addUserInterestsService(userId, interests);
        response.sendStatus(200);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function blockUserController(request: Request, response: Response) {
    const userId = request.user.id;

    const blockedUserId = Number(request.params.userId);

    // console.log('BlockingUserId: ' + userId);
    // console.log('BlockedUserId: ' + blockedUserId);

    if (userId === blockedUserId) {
        response.sendStatus(400);
        return ;
    }

    try {
        await blockUserService(userId, blockedUserId);

        response.sendStatus(201);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function reportFakeAccountController(request: Request, response: Response) {
    const userId = request.user.id;

    const reportedUserId = Number(request.params.userId);

    if (userId === reportedUserId) {
        response.sendStatus(400);
        return ;
    }

    // console.log('reportingUserId: ' + userId);
    // console.log('reportedUserId: ' + reportedUserId);

    try {
        await reportFakeAccountService(userId, reportedUserId);

        response.sendStatus(201);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function likeProfileController(request: Request, response: Response) {
    const userId = request.user.id;

    const likedUserId = Number(request.params.userId);

    if (userId === likedUserId) {
        response.sendStatus(400);
        return ;
    }    

    try {
        await likeProfileService(userId, likedUserId);

        response.sendStatus(201);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function unlikeProfileController(request: Request, response: Response) {
    const userId = request.user.id;

    const unlikedUserId = Number(request.params.userId);

    // console.log('unlikingUserId: ' + userId);
    // console.log('unlikedUserId: ' + unlikedUserId);

    if (userId === unlikedUserId) {
        response.sendStatus(400);
        return ;
    }

    try {
        await unlikeProfileService(userId, unlikedUserId);

        response.sendStatus(201);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function updatePersonalInfoController(request: Request, response: Response) {
    const file = request.file as Express.Multer.File;

    let profilePicturePath = null;
    const username = request.body.username as string;
    const firstname = request.body.firstname as string;
    const lastname = request.body.lastname as string;
    const gender = request.body.gender as string;
    const age = Number(request.body.age as string);
    const biography = request.body.biography as string;
    const sexualPreference = request.body.sexualPreference as string;
    const userId = request.user.id;


    if (file) {
        profilePicturePath = file.path;
    }

    try {
        const personalInfo = {profilePicturePath, username, firstname, lastname, age, gender, sexualPreference, biography}
        const imageUrl = await updatePersonalInfoService(userId, personalInfo);

        response.status(201).send( { msg: 'personal info completed!', imageUrl } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function storeUserLocation(request: Request, response: Response) {
    const userId = request.user.id;
    // TODO : add an indicator when the user denied, to use an IP geolocation fallback

    // console.log(request.body);
    try {
        await updateUserLocation(userId, request.body);
        response.sendStatus(200);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}

export async function addPhotosController(request: Request, response: Response) {
    const MAX_PHOTOS = 4;
    
    try {
        const userId = request.user.id;
        const files = request.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            response.status(400).send({ msg: 'No files uploaded' });
            return;
        }

        const currentPhotoCount = await getUserPhotoCount(userId);
        
        if (currentPhotoCount >= MAX_PHOTOS) {
            response.status(400).send({ msg: 'Maximum photo limit reached' });
            return;
        }

        const availableSlots = MAX_PHOTOS - currentPhotoCount;
        const photosToAdd = files.slice(0, availableSlots);
        const photosPaths: string[] = photosToAdd.map(file => file.path);

        await addUserPhotosService(userId, photosPaths);
        
        response.status(200).send({ 
            message: 'Photos uploaded successfully', 
            count: photosToAdd.length,
            total: currentPhotoCount + photosToAdd.length
        });
    } catch (error) {
        console.error('Error uploading photos:', error);
        response.status(500).send({ message: 'Error uploading photos' });
    }
}

export async function removePhotoController(request: Request, response: Response) {
    try {
        const userId = request.user.id;
        const { photoId } = request.body;

        if (!photoId || typeof photoId !== 'number') {
            response.status(400).send({ msg: 'Valid photo ID is required' });
            return;
        }

        const removed = await removeUserPhotoService(userId, photoId);
        
        if (!removed) {
            response.status(404).send({ msg: 'Photo not found' });
            return;
        }

        response.status(200).send({ message: 'Photo removed successfully' });
    } catch (error) {
        console.error('Error removing photo:', error);
        response.status(500).send({ message: 'Error removing photo' });
    }
}