export type UserPhoto = {
    id: number;
    url: string;
};

export type ProfileInfo = {
    userInfo: UserInfo;
    interests: Set<string>;
    userPhotos: UserPhoto[];
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

export type BriefProfileInfoPresence = BriefProfileInfo & {status: string};
export type RecommendedProfileInfo = {
    id: string;
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
    commonInterestsCount: number;
    profileInterests: Set<string>;
    profilePhotos: string[];
};

export type BackendRecommendedProfile= Omit<RecommendedProfileInfo, 'profileInterests'> & {
    profileInterests: string[];
};

export type Coords = {
    lat: number;
    lon: number;
};