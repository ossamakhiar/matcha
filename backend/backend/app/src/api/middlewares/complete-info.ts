import { Request, Response, NextFunction } from 'express'
import { formError } from '../helpers/errorFactory.js';
import { isAgeValid, isFirstNameValid, isGenderAndSexualPreferenceValid, isLastNameValid, isUsernameValid } from '../validators/userCredentials.js';

export function validateCompleteProfileBody(request: Request, response: Response, next: NextFunction): void {
    const { username, firstname, age, biography, lastname, gender, sexualPreference } = request.body;

    const requiredFields = { username, firstname, lastname, gender, biography, sexualPreference };

    if (age == undefined || typeof age != 'string') {
        response.status(400).send(formError('age', 'invalid age'));
        return ; 
    }

    for (const field in requiredFields) {
        if (requiredFields[field as keyof typeof requiredFields] == undefined || typeof requiredFields[field as keyof typeof requiredFields] !== 'string') {
            response.status(400).send(formError(field, `${field} is required`));
            return;
        }
    }

    if (username && !isUsernameValid(username)) {
        response.status(400).send(formError('username', 'invalid username'));
        return ;
    }

    if (firstname && !isFirstNameValid(firstname)) {
        response.status(400).send(formError('firstname', 'invalid firstname'));
        return ;
    }

    if (lastname && !isLastNameValid(lastname)) {
        response.status(400).send(formError('lastname', 'invalid lastname'));
        return ;
    }

    if (!isAgeValid(Number(age))) {
        response.status(400).send(formError('age', 'invalid age'));
        return ;
    }

    if (!isGenderAndSexualPreferenceValid(gender, sexualPreference)) {
        response.status(400).send(formError('sexualPreference', 'invalid gender and sexual preference combination'))
        return ;
    }

    if (biography.length > 150) {
        response.status(400).send(formError('biography', 'too long biography, it must be no more than 150 characters'));
        return ;
    }

    next();
}

export async function checkIfAlreadyCompleted(request: Request, response: Response, next: NextFunction) {
    const completeInfoCookie = request.cookies['CompleteProfile'];

    if (completeInfoCookie && completeInfoCookie === 3) {
        response.status(403).send( { url: process.env.FRONTENT_PROFILE_URL } );
        return ;
    }

    next();
}
