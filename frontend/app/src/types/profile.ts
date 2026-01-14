export type ProfileInfos = {
    userInfos: UserInfos;
    interests: Set<string>;
    userPhotos: string[];
}

export type UserInfos = {
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

export type BriefProfileInfos = {
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

export type BriefProfileInfosPresence = BriefProfileInfos & {status: string};
export type RecommendedProfileInfos = {
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

export type BackendRecommendedProfile= Omit<RecommendedProfileInfos, 'profileInterests'> & {
    profileInterests: string[];
};

export type Coords = {
    lat: number;
    lon: number;
};