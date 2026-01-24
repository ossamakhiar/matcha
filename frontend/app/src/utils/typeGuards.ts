import { BackendRecommendedProfile, BriefProfileInfo, Coords, ProfileInfo, UserInfo } from "../types/profile";
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

export function isOfUserInfoType(obj: any): obj is UserInfo {
    return (
      obj !== null && typeof obj === 'object' &&
      (typeof obj.id === 'string' || typeof obj.id === 'number') &&
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
  
export function isOfProfileInfoType(obj: any) : obj is ProfileInfo {
    return (
        obj !== null && typeof obj === 'object'
        && isArray(obj.interests, undefined, 'string')
        && isArray(obj.userPhotos, undefined, 'string')
        && obj.userPhotos.length <= 4
        && isOfUserInfoType(obj.userInfo)
    );
}

export function isOfBriefProfileInfoType(obj: any): obj is BriefProfileInfo {
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

export function isOfBackendRecommendedProfileType(obj: any): obj is BackendRecommendedProfile {
    return (
        obj !== null &&
        typeof obj === 'object' &&
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
        typeof obj.latitude === 'number' &&
        typeof obj.longitude === 'number' &&
        Array.isArray(obj.profileInterests) &&
        obj.profileInterests.every((i: any) => typeof i === 'string') &&
        Array.isArray(obj.profilePhotos) &&
        obj.profilePhotos.every((p: any) => typeof p === 'string')
    );
}


export function isOfCoordsType(obj: any): obj is Coords {
    return (
        obj !== null && typeof obj === 'object' &&
        typeof obj.lat === 'number' &&
        typeof obj.lon === 'number'
    )
}

