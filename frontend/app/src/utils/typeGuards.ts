import { BriefProfileInfos, ProfileInfos, RecommendedProfileInfos, UserInfos } from "../types/profile";
import { isArray } from "./generalPurpose";

export function getFormError(error: unknown): FormError | undefined {
    if (error != null && typeof error == 'object'
        && 'field' in error && 'message' in error
        && typeof error.message == 'string' && typeof error.field == 'string') {
        return (
            {
                message: error.message,
                field: error.field
            }
        );
    }

    return (undefined);
}

export function isOfUserInfosType(obj: any): obj is UserInfos {
    return (
    obj !== null && typeof obj === 'object' &&
    // typeof obj.id === 'string' && // !! there is an inconsitenty here it could be number
    typeof obj.isSelf === 'boolean' &&
    typeof obj.isLiked === 'boolean' &&
    typeof obj.isLiking === 'boolean' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.userName === 'string' &&
    typeof obj.longitude === 'number' &&
    typeof obj.latitude === 'number' &&
    typeof obj.age === 'number' &&
    typeof obj.gender === 'string' &&
    typeof obj.sexualPreferences === 'string' &&
    typeof obj.profilePicture === 'string' &&
    typeof obj.biography === 'string' &&
    typeof obj.fameRating === 'number'
    );
}

export function isOfProfileInfosType(obj: any) : obj is ProfileInfos {
    return (
        obj !== null && typeof obj === 'object'
        && isArray(obj.interests, undefined, 'string')
        && isArray(obj.userPhotos, undefined, 'string')
        && obj.userPhotos.length <= 4
        && isOfUserInfosType(obj.userInfos)
    );
}

export function isOfBriefProfileInfosType(obj: any): obj is BriefProfileInfos {
    return (
    obj !== null && typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.userName === 'string' &&
    typeof obj.age === 'number' &&
    typeof obj.gender === 'string' &&
    typeof obj.sexualPreferences === 'string' &&
    typeof obj.biography === 'string' &&
    typeof obj.profilePicture === 'string'
    );
}

export function isOfRecommendedProfileInfosType(obj: any): obj is RecommendedProfileInfos {
    return (
        obj !== null && typeof obj === 'object' &&
        typeof obj.id === 'string' &&
        typeof obj.firstName === 'string' &&
        typeof obj.lastName === 'string' &&
        typeof obj.userName === 'string' &&
        typeof obj.age === 'number' &&
        typeof obj.gender === 'string' &&
        typeof obj.sexualPreferences === 'string' &&
        typeof obj.profilePicture === 'string' &&
        typeof obj.biography === 'string' &&
        typeof obj.fameRating === 'number' &&
        typeof obj.commonInterestsCount === 'number' &&
        isArray(obj.profileInterests, undefined, 'string') &&
        isArray(obj.profilePhotos, undefined, 'string')
    );
}

// export type RecommendedProfileInfos = {
//     id: string;
//     firstName: string;
//     lastName: string;
//     userName: string;
//     age: number;
//     gender: string;
//     sexualPreferences: string;
//     profilePicture: string; // URL
//     biography: string;
//     fameRating: number;
//     commonInterestsCount: number;
//     profileInterests: Set<string>;
//     profilePhotos: string[];
// };