import { Request, Response } from 'express'
import { getUserIdFromJwtService } from "../services/jwt.js";
import { addUserInterestsService } from '../services/profile.js';
import { addUserPhotosService, setProfileAsCompleteService, updatePersonalInfoService } from '../services/complete-profile.js';
import dotenv from 'dotenv'
import { setCompleteProfileInfoCookie } from '../utils/cookies.js';
import { isArray } from '../validators/generalPurpose.js';

dotenv.config();

export async function completeInterestsController(request: Request, response: Response) {
    const completeInfoCookie = request.cookies['CompleteProfile'];

    if (completeInfoCookie != 1) {
        let redirectUrl = process.env.FRONTENT_PROFILE_URL;

        if (completeInfoCookie == undefined) {
            redirectUrl = process.env.FRONTENT_COMPLETE_PROFILE_INFO_URL;
        } else if (completeInfoCookie == 2) {
            redirectUrl = process.env.FRONTEND_COMPLETE_PHOTOS_URL;
        }

        response.status(403).send( { url: redirectUrl } );
        return ;
    }

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
        setCompleteProfileInfoCookie(2, response);
        response.sendStatus(200);
    }
    catch (err) {
        response.sendStatus(500);
    }
}

export async function completePhotosController(request: Request, response: Response) {
    const completeInfoCookie = request.cookies['CompleteProfile'];

    if (completeInfoCookie != 2) {
        let redirectUrl = process.env.FRONTENT_PROFILE_URL;

        if (completeInfoCookie == undefined) {
            redirectUrl = process.env.FRONTENT_COMPLETE_PROFILE_INFO_URL;
        } else if (completeInfoCookie == 1) {
            redirectUrl = process.env.FRONTEND_COPMPLETE_INTERESTS_URL;
        }

        response.status(403).send( { url: redirectUrl } );
        return ;
    }

    try {
        const files = request.files as Express.Multer.File[];

        if (!files) {
            response.status(400).send( { msg: 'upload error' } );
            return ;
        }

        const accessToken = request.cookies['AccessToken'] as string;
        const { userId } = getUserIdFromJwtService(accessToken);
        const photosPaths: string[] = files.map(file => file.path);

        await addUserPhotosService(userId as number, photosPaths);
        await setProfileAsCompleteService(userId as number);
        setCompleteProfileInfoCookie(3, response);
        response.status(200).send({ message: 'Files uploaded successfully', files });
    } catch (error) {
        response.status(500).send({ message: 'Error uploading files' });
    }
}

export async function completePersonalInfoController(request: Request, response: Response) {
    const completeInfoCookie = request.cookies['CompleteProfile'];

    if (completeInfoCookie) {
        let redirectUrl = process.env.FRONTENT_PROFILE_URL;

        if (completeInfoCookie == 1) {
            redirectUrl = process.env.FRONTEND_COPMPLETE_INTERESTS_URL;
        } else if (completeInfoCookie == 2) {
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
    const accessToken = request.cookies['AccessToken'] as string;
    const { userId } = getUserIdFromJwtService(accessToken);

    if (file) {
        profilePicturePath = file.path;
    }

    try {
        const personalInfo = {profilePicturePath, username, firstname, lastname, age, gender, biography, sexualPreference}
        await updatePersonalInfoService(userId as number, personalInfo);

        setCompleteProfileInfoCookie(1, response);
        response.status(201).send( { msg: 'personal info completed!' } );
    }

    catch (err) {
        response.sendStatus(500);
    }
}
