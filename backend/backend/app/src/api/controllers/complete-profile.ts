import { Request, Response } from 'express'
import { addUserInterestsService } from '../services/profile.js';
import { addUserPhotosService, setProfileAsCompleteService, updatePersonalInfoService } from '../services/complete-profile.js';
import dotenv from 'dotenv'
import { setCompleteProfileInfoCookie } from '../utils/cookies.js';
import { isArray } from '../validators/generalPurpose.js';
import { CompleteProfileNextStep } from '../types/enums.js';

dotenv.config();

export async function completeInterestsController(request: Request, response: Response) {
    const completeInfoCookie = Number(request.cookies['CompleteProfile']);

    if (completeInfoCookie != CompleteProfileNextStep.INTERESTS_NEXT) {
        let redirectUrl = process.env.FRONTEND_PROFILE_URL
;

        if (completeInfoCookie == undefined) {
            redirectUrl = process.env.FRONTEND_COMPLETE_PROFILE_INFO_URL;
        } else if (completeInfoCookie == CompleteProfileNextStep.PHOTOS_NEXT) {
            redirectUrl = process.env.FRONTEND_COMPLETE_PHOTOS_URL;
        }

        response.status(403).send( { url: redirectUrl } );
        return ;
    }

    const userId = request.user.id;

    const { interests } = request.body;

    if (!isArray(interests, undefined, 'string')) {
        response.status(400).send( { msg: 'bad interests request body' } );
        return ;
    }

    try {
        await addUserInterestsService(userId, interests);
        setCompleteProfileInfoCookie(CompleteProfileNextStep.PHOTOS_NEXT, response);
        response.sendStatus(200);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function completePhotosController(request: Request, response: Response) {
    const completeInfoCookie = Number(request.cookies['CompleteProfile']);


    if (completeInfoCookie != CompleteProfileNextStep.PHOTOS_NEXT) {
        let redirectUrl = process.env.FRONTEND_PROFILE_URL
;

        if (completeInfoCookie == undefined) {
            redirectUrl = process.env.FRONTEND_COMPLETE_PROFILE_INFO_URL;
        } else if (completeInfoCookie == CompleteProfileNextStep.INTERESTS_NEXT) {
            redirectUrl = process.env.FRONTEND_COMPLETE_INTERESTS_URL;
        }

        response.status(403).send( { url: redirectUrl } );
        return ;
    }

    try {
        const files = request.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            response.status(400).send( { msg: 'upload error' } );
            return ;
        }

        const userId = request.user.id;
        const photosPaths: string[] = files.map(file => file.path);

        await addUserPhotosService(userId, photosPaths);
        await setProfileAsCompleteService(userId);
        setCompleteProfileInfoCookie(CompleteProfileNextStep.DONE, response);
        response.status(200).send({ message: 'Files uploaded successfully', files });
    } catch (error) {
        response.status(500).send({ message: 'Error uploading files' });
    }
}

export async function completePersonalInfoController(request: Request, response: Response) {
    const completeInfoCookie = Number(request.cookies['CompleteProfile']);

    if (completeInfoCookie) {
        let redirectUrl = process.env.FRONTEND_PROFILE_URL
;

        if (completeInfoCookie == CompleteProfileNextStep.INTERESTS_NEXT) {
            redirectUrl = process.env.FRONTEND_COMPLETE_INTERESTS_URL;
        } else if (completeInfoCookie == CompleteProfileNextStep.PHOTOS_NEXT) {
            redirectUrl = process.env.FRONTEND_COMPLETE_PHOTOS_URL;
        }

        response.status(403).send( { url: redirectUrl } );
        return ;
    }

    const file = request.file as Express.Multer.File;

    let profilePicturePath = null;
    const username = request.body.username as string;
    const firstname = request.body.firstname as string;
    const lastname = request.body.lastname as string;
    const age = Number(request.body.age as string);
    const gender = request.body.gender as string;
    const biography = request.body.biography as string;
    const sexualPreference = request.body.sexualPreference as string;
    const userId = request.user.id;


    if (file) {
        profilePicturePath = file.path;
    }

    try {
        const personalInfo = {profilePicturePath, username, firstname, lastname, age, gender, biography, sexualPreference}
        await updatePersonalInfoService(userId, personalInfo);

        setCompleteProfileInfoCookie(CompleteProfileNextStep.INTERESTS_NEXT, response);
        response.status(201).send( { msg: 'personal info completed!' } );
    }

    catch (err) {
        response.sendStatus(500);
    }
}
