import pool from "../model/pgPoolConfig.js";
import { Filters } from "../types/explore.js";
import { RecommendedProfileInfos } from "../types/profile.js";
import { getMatchingSexualOrientation, getOppositeGenders } from "../utils/explore.js";
import dotenv from 'dotenv'
import { getUserInterests } from "./profile.js";

dotenv.config();

export async function getRecommendedProfilesService(userId: number, filters: Filters): Promise<RecommendedProfileInfos[]> {
    // console.log('AgeFilter: ' + filters.ageRange);
    // console.log('FameRatingFitler: ' + filters.fameRatingRange);
    // console.log('interests: ' + filters.interests);
    try {
        const userInterests = filters.interests ?? await getUserInterests(userId);
        const profiles = await filterProfilesByPersonalInfos(userId, filters.fameRatingRange, filters.ageRange);

        // console.log('userInterests: ' + userInterests);

        let filteredIds = profiles.map(profile => Number(profile.id));
        if (filteredIds.length === 0) return [];

        filteredIds = await filterAlreadyLikedProfiles(userId, filteredIds);
        if (filteredIds.length === 0) return [];

        const interestsFilteredIds = await filterProfilesByInterests(userId, filteredIds, userInterests, 1);
        if (interestsFilteredIds.length === 0) return [];

        const interestsFilteredIdsMap = new Map<number, [number, string[]]>(
            interestsFilteredIds.map(user => [user.userId, [user.commonInterestsCount, user.profileInterests]])
        );

        let finalProfiles = profiles.filter(profile => {
            const value = interestsFilteredIdsMap.get(Number(profile.id));
            if (value !== undefined) {
                profile.commonInterestsCount = value[0];
                profile.profileInterests = value[1];
                return true;
            }
            return false;
        });

        const profilePhotos = await getProfilesPhotos(filteredIds);

        const profilePhotosMap = new Map<number, string[]>(
            profilePhotos.map(photoObj => [photoObj.userId, photoObj.photos])
        );

        finalProfiles.forEach(profile => {
            profile.profilePhotos = profilePhotosMap.get(Number(profile.id)) || [];
        });
        // sort the profiles

        finalProfiles = await filterBlockedUsers(userId, finalProfiles);

        return finalProfiles;
    } catch (error) {
        console.error('Error getting recommended profiles:', error);
        throw new Error('Failed to get recommended profiles');
    }
}

async function filterProfilesByPersonalInfos(
    userId: number,
    fameRatingRange: number[],
    ageRange: number[]
): Promise<RecommendedProfileInfos[]> {
    let client;

    try {
        client = await pool.connect();

        const userPreferencesQuery = `SELECT gender, sexual_preference FROM "user" WHERE id = $1`;
        const userPreferencesResult = await client.query(userPreferencesQuery, [userId]);

        if (userPreferencesResult.rows.length === 0) {
            throw new Error(`No user found with the provided userId: ${userId}`);
        }

        const userPreferences = userPreferencesResult.rows[0];
        const sexualPreferences = getMatchingSexualOrientation(userPreferences.gender, userPreferences.sexual_preference);
        const oppositeGenders = getOppositeGenders(userPreferences.gender);

        console.log('suggestedSexualPreferences: ' + sexualPreferences);
        console.log('suggestedGenders: ' + oppositeGenders);

        const profilesQuery = `
            SELECT id, first_name, last_name, username, age, gender,
            sexual_preference, biography, profile_picture, fame_rating 
            FROM "user" 
            WHERE id != $1 
            AND (
                (sexual_preference = ANY($2::text[]) AND sexual_preference != 'heterosexual')
                OR 
                (sexual_preference = 'heterosexual' AND 'heterosexual' = ANY($2::text[]) AND gender = ANY($3::text[]))
            )
            AND fame_rating BETWEEN $4 AND $5
            AND age BETWEEN $6 AND $7
            LIMIT 30;
        `;

        const profilesResult = await client.query(profilesQuery, [
            userId,
            sexualPreferences,
            oppositeGenders,
            fameRatingRange[0],
            fameRatingRange[1],
            ageRange[0],
            ageRange[1],
        ]);

        return profilesResult.rows.map(user => {
            const profilePicture = user.profile_picture 
                ? `${process.env.BASE_URL}/${user.profile_picture}` 
                : process.env.DEFAULT_PROFILE_PICTURE as string;

            return {
                id: String(user.id),
                firstName: user.first_name,
                lastName: user.last_name,
                userName: user.username,
                age: user.age ?? 18,
                gender: user.gender ?? '',
                sexualPreferences: user.sexual_preference ?? '',
                biography: user.biography ?? `Hey there, I am using matcha. Looking for someone to share sunsets and spontaneous road trips. Let’s make memories together.`,
                profilePicture,
                fameRating: user.fame_rating,
                commonInterestsCount: 0,
                profileInterests: [],
                profilePhotos: []
            };
        });
    } catch (err) {
        console.error(`Error filtering profiles for user ${userId}:`, err);
        throw new Error('Failed to filter profiles');
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function filterProfilesByInterests(
    userId: number,
    filteredUserIds: number[],
    userInterests: string[],
    interestThreshold: number
): Promise<{ userId: number, commonInterestsCount: number, profileInterests: string[] }[]> {
    if (filteredUserIds.length === 0) {
        return [];
    }

    let client;

    try {
        client = await pool.connect();

        const filteredUserInterestsQuery = `
            SELECT user_id, interest FROM user_interest
            WHERE user_id = ANY($1::int[])
        `;
        const filteredUserInterestsResult = await client.query(filteredUserInterestsQuery, [filteredUserIds]);

        const userInterestsMap = new Map<number, Set<string>>();
        
        filteredUserInterestsResult.rows.forEach(row => {
            const user = row.user_id;
            const interest = row.interest;

            if (!userInterestsMap.has(user)) {
                userInterestsMap.set(user, new Set());
            }

            userInterestsMap.get(user)!.add(interest);
        });

        const matchedUsers = Array.from(userInterestsMap.entries()).map(([userId, interests]) => {
            const commonInterestsCount = Array.from(interests).filter(interest => userInterests.includes(interest)).length;
            return {
                userId,
                commonInterestsCount,
                profileInterests: Array.from(interests)
            };
        });

        const filteredMatchedUsers = matchedUsers.filter(user => user.commonInterestsCount >= interestThreshold);

        return filteredMatchedUsers;
    } catch (err) {
        console.error(`Error filtering profiles by interests for user ${userId}:`, err);
        throw new Error('Failed to filter profiles by interests');
    } finally {
        if (client) {
            client.release();
        }
    }
}


async function filterAlreadyLikedProfiles(userId: number, filteredUserIds: number[]): Promise<number[]> {
    let client;

    try {
        client = await pool.connect();
        const query = `
            SELECT liked_user_id FROM "user_likes"
            WHERE liking_user_id = $1 AND liked_user_id = ANY($2::int[])
        `;
        
        const result = await client.query(query, [userId, filteredUserIds]);

        const likedUserIds = new Set(result.rows.map(row => row.liked_user_id));

        const filteredProfileIds = filteredUserIds.filter(id => !likedUserIds.has(id));

        return filteredProfileIds;
    } catch (err) {
        console.error('Error filtering already liked profiles:', err);
        throw new Error('Failed to filter already liked profiles');
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function getProfilesPhotos(userIds: number[]): Promise<{ userId: number, photos: string[] }[]> {
    let client;

    try {
        client = await pool.connect();

        const query = `SELECT user_id, photo FROM "user_photo" WHERE user_id = ANY($1::int[])`;
        const result = await client.query(query, [userIds]);

        if (result.rows.length === 0) {
            return [];
        }

        const profilesPhotosMap = new Map<number, string[]>();

        result.rows.forEach(row => {
            const userId = row.user_id;
            const photoUrl = row.photo;

            if (!profilesPhotosMap.has(userId)) {
                profilesPhotosMap.set(userId, []);
            }

            profilesPhotosMap.get(userId)?.push(process.env.BASE_URL as string + '/' + photoUrl);
        });

        return Array.from(profilesPhotosMap.entries()).map(([userId, photos]) => ({
            userId,
            photos
        }));
    } catch (err) {
        console.error('Error retrieving profile photos:', err);
        throw new Error('Failed to retrieve profile photos');
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function filterBlockedUsers(
    userId: number,
    profiles: RecommendedProfileInfos[]
): Promise<RecommendedProfileInfos[]> {
    const client = await pool.connect();

    try {
        const profileIds = profiles.map(profile => Number(profile.id));

        if (profileIds.length === 0) return [];

        const blockedUsersQuery = `
            SELECT blocked_user_id FROM blocked_users
            WHERE blocking_user_id = $1 AND blocked_user_id = ANY($2::int[])
            UNION
            SELECT blocking_user_id FROM blocked_users
            WHERE blocked_user_id = $1 AND blocking_user_id = ANY($2::int[]);
        `;

        const blockedUsersResult = await client.query(blockedUsersQuery, [userId, profileIds]);
        const blockedUserIds = new Set(blockedUsersResult.rows.map(row => row.blocked_user_id));

        const filteredProfiles = profiles.filter(profile => !blockedUserIds.has(Number(profile.id)));

        return filteredProfiles;
    } catch (err) {
        console.error(`Error filtering blocked users for user ${userId}:`, err);
        throw new Error('Failed to filter blocked users');
    } finally {
        client.release();
    }
}
