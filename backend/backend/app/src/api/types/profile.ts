export type ProfileInfo = {
    userInfo: UserInfo;
    interests: string[];
    userPhotos: string[];
}

export type UserInfo = {
    id: string;
    isSelf: boolean;
    isLiked: boolean;
    isLiking: boolean;
    firstName: string;
    lastName: string;
    userName: string;
    longitude: number;
    latitude: number;
    age: number;
    gender: string;
    sexualPreferences: string;
    profilePicture: string; // URL
    biography: string;
    fameRating: number;
};

export type RecommendedProfileInfo = {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    latitude: number;
    longitude: number;
    age: number;
    gender: string;
    sexualPreferences: string;
    profilePicture: string; // URL
    biography: string;
    fameRating: number;
    commonInterestsCount: number;
    profileInterests: string[];
    profilePhotos: string[];
};

export type BriefProfileInfo = {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    age: number;
    gender: string;
    sexualPreferences: string;
    biography: string;
    profilePicture: string;
};

export type updateProfilePersonalInfo = {
    profilePicturePath: string | null;
    username: string;
    firstname: string;
    lastname: string;
    age: number;
    gender: string;
    biography: string;
    sexualPreference: string;
};