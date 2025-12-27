import zxcvbn from 'zxcvbn';
import { passwordValidation } from '../types/passwordValidation.js';

export function isUsernameValid(username: string): boolean {
    const usernameRegexp = /^(?!_)(?!.*__)[a-zA-Z0-9_]{4,12}(?<!_)$/

    if (usernameRegexp.test(username) === false) {
        console.log('invalid username');
    }

    return (usernameRegexp.test(username));
}

export function isPasswordValid(password: string): passwordValidation {
    // * password policy
    const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*() ]{12,28}$/;

    if (passwordRegexp.test(password) === false) {
        return {
            status: false,
            message: "password doesn't adhere to the policy"
        };
    }

    const password_estimation = zxcvbn(password)
    return {
        status: password_estimation.score >= 3,
        message: password_estimation.feedback.warning,
    }
}

export function isEmailFormatValid(email: string): boolean {
    const emailRegexp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailRegexp.test(email) === false) {
        console.log('invalid email');
    }

    return (emailRegexp.test(email));
}


export function isFirstNameValid(firstName: string): boolean {
    const firstnameRegexp = /^[a-zA-Z]{2,20}$/;

    return (firstnameRegexp.test(firstName));
}

export function isLastNameValid(firstName: string): boolean {
    const lastnameRegexp = /^[a-zA-Z]{2,20}$/;

    return (lastnameRegexp.test(firstName));
}

export function isGenderAndSexualPreferenceValid(gender: string, sexualPreference: string): boolean {
    const handledGenders = new Set(['male', 'female', 'transgender-male', 'transgender-female']);
    const handledSexualPreferences = new Set(['heterosexual', 'bisexual-male', 'bisexual-female', 'homosexual', 'lesbian']);

    if (!handledGenders.has(gender) || !handledSexualPreferences.has(sexualPreference)) {
        return (false);
    }

    if ((gender === 'male' || gender === 'transgender-male') && (sexualPreference == 'lesbian' || sexualPreference == 'bisexual-female')) {
        return (false);
    }

    if ((gender === 'female' || gender === 'transgender-female') && (sexualPreference === 'homosexual' || sexualPreference === 'bisexual-male')) {
        return (false);
    }

    return (true);
}

export function isAgeValid(age: number) {
    return (age >= 18 && age <= 30);
}