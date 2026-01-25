import interestsList from "../helpers/interestsList.js";
import pool from "../model/pgPoolConfig.js";
import { BriefProfileInfo, ProfileInfo, UserInfo, UserPhoto } from "../types/profile.js";
import dotenv from 'dotenv'

dotenv.config();

export async function getUserInterests(userId: number): Promise<string[]> {
    let client;

    try {
        client = await pool.connect();
        const query = `SELECT interest FROM "user_interest" WHERE user_id = $1;`
        
        const result = await client.query(query, [userId]);

        if (result.rows.length === 0) {
            return [];
        }
            
        const interests = result.rows.map(row => row.interest);
        
        return (interests);
    }
    catch (err) {
        throw new Error('failed to retrieve brief profile interests');
    } finally {
        if (client) {
            try {
                client.release();
            } catch (releaseErr) {
                console.error('Failed to release client:', releaseErr);
            }
        }
    }
}

async function getUserPhotos(userId: number): Promise<UserPhoto[]> {
    let client;

    try {
        client = await pool.connect();
        const query = `SELECT id, photo FROM "user_photo" WHERE user_id = $1;`

        const result = await client.query(query, [userId]);

        if (result.rows.length === 0) {
            return [];
        }

        const photos = result.rows.map(row => ({
            id: row.id,
            url: process.env.BASE_URL + '/' + row.photo
        }));

        return photos;
    }
    catch (err) {
        throw new Error('failed to retrieve profile photos');
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function getUserInfo(userId: number, visitorUserId: number): Promise<UserInfo> {
    let client;

    try {
        client = await pool.connect();
        const query = `SELECT first_name, last_name, username, age, gender,
            sexual_preference, biography, profile_picture, fame_rating, longitude, latitude FROM "user" WHERE id = $1;`

        const result = await client.query(query, [userId]);

        if (result.rows.length === 0) {
            throw new Error(`couldn't retrieve user info`);
        }

        const user = result.rows[0];

        let isSelf = userId === visitorUserId;
        let isLiked = false;
        let isLiking = false;

        if (!isSelf) {
            const firstLikeStateQuery = `SELECT id FROM "user_likes" 
                WHERE liking_user_id=$1 AND liked_user_id=$2`;
            const secondLikeStateQuery = `SELECT id FROM "user_likes" 
                WHERE liking_user_id=$2 AND liked_user_id=$1`;
            const parameters = [userId, visitorUserId];

            let isLikingResult = await client.query(firstLikeStateQuery, parameters);

            if (isLikingResult.rows.length > 0) {
                isLiking = true;
            }

            let isLikedResult = await client.query(secondLikeStateQuery, parameters);

            if (isLikedResult.rows.length > 0) {
                isLiked = true;
            }
        }

        const profilePicture = user.profile_picture ? process.env.BASE_URL as string + '/' + user.profile_picture : process.env.DEFAULT_PROFILE_PICTURE as string;


        return ({
            id: String(userId),
            firstName: user.first_name,
            lastName: user.last_name,
            userName: user.username,
            longitude: Number(user.longitude),
            latitude: Number(user.latitude),
            age: user.age ?? 18,
            gender: user.gender ?? '',
            sexualPreferences: user.sexual_preference ?? '',
            biography: user.biography ?? `Hey there, I am using matcha. Looking for someone to share sunsets and spontaneous road trips. let’s make memories together.`,
            profilePicture,
            fameRating: user.fame_rating,
            isSelf,
            isLiked,
            isLiking
        });
    }
    catch (err) {
        throw new Error('failed to retrieve brief profile info');
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function getProfileInfoService(userId: number, visitorUserId: number): Promise<ProfileInfo | undefined> {
    if (!userId) {
        return (undefined);
    }

    const userInfo = await getUserInfo(userId, visitorUserId);
    const interests = await getUserInterests(userId);
    const userPhotos = await getUserPhotos(userId);

    return ({userInfo, interests, userPhotos});
}

export async function getBriefProfileInfoService(userId: number): Promise<BriefProfileInfo | undefined> {
    let client;

    try {
        client = await pool.connect();
        const query = `SELECT first_name, last_name, username, age, gender,
            sexual_preference, biography, profile_picture FROM "user" WHERE id = $1;`

        const result = await client.query(query, [userId]);

        if (result.rows.length === 0) {
            return (undefined);
        }

        const user = result.rows[0];

        return ({
            id: String(userId),
            firstName: user.first_name,
            lastName: user.last_name,
            userName: user.username,
            age: user.age ?? 18,
            gender: user.gender ?? '',
            sexualPreferences: user.sexual_preference ?? '',
            biography: user.biography ?? `Hey there, I am using matcha. Looking for someone to share sunsets and spontaneous road trips. let's make memories together.`,
            profilePicture: user.profile_picture ?? process.env.DEFAULT_PROFILE_PICTURE
        })
    }
    catch (err) {
        throw new Error('failed to retrieve brief profile info');
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function updateUserInterestsService(userId: number, newInterests: string[]): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        const filteredInterests = newInterests.filter(interest => interestsList.has(interest));

        if (filteredInterests.length === 0) {
            throw new Error('no valid interest');
        }

        const deleteQuery = 'DELETE FROM user_interest WHERE user_id = $1';
        await client.query(deleteQuery, [userId]);

        const insertQuery = `
            INSERT INTO user_interest (user_id, interest)
            VALUES ${filteredInterests.map((_, index) => `($1, $${index + 2})`).join(', ')}
        `;

        const values = [userId, ...filteredInterests];
        await client.query(insertQuery, values);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating user interests:', err);
        throw new Error('Failed to update user interests');
    } finally {
        client.release();
    }
}

export async function addUserInterestsService(userId: number, interests: string[]) {
    let client;

    try {
        const filteredInterests = interests.filter(interest => interestsList.has(interest));

        if (filteredInterests.length === 0) {
            throw new Error('no valid interest');
        }

        const placeholders = filteredInterests.map((_, index) => `($1, $${index + 2})`).join(', ');

        const query = `
            INSERT INTO user_interest (user_id, interest)
            VALUES ${placeholders}
            ON CONFLICT (user_id, interest) DO NOTHING;
        `;

        client = await pool.connect();

        await client.query('BEGIN');
        await client.query(query, [userId, ...filteredInterests]);
        await client.query('COMMIT');
    }
    catch (err) {
        if (client) {
            await client.query('ROLLBACK');
        }
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

// async function removeUserConnection(blockingUserId: number, blockedUserId: number) {
//     await unlikeProfileService(blockingUserId, blockedUserId);
//     await unlikeProfileService(blockedUserId, blockingUserId);
// }

async function addBlockedUser(blockingUserId: number, blockedUserId: number) {
    const client = await pool.connect();

    try {
        const insertBlockQuery = `
            INSERT INTO blocked_users (blocking_user_id, blocked_user_id)
            VALUES ($1, $2)
            ON CONFLICT (blocking_user_id, blocked_user_id) DO NOTHING
            RETURNING id;
        `;
        const result = await client.query(insertBlockQuery, [blockingUserId, blockedUserId]);

    } catch (err) {
        console.error('Error blocking user:', err);
        throw new Error('Failed to block user');
    } finally {
        client.release();
    }
}

export async function blockUserService(blockingUserId: number, blockedUserId: number) {
    // await removeUserConnection(blockingUserId, blockedUserId);
    await addBlockedUser(blockingUserId, blockedUserId);
}

export async function reportFakeAccountService(reportingUserId: number, reportedUserId: number): Promise<void> {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const insertReportQuery = `
            INSERT INTO fake_account_report (reporting_user_id, reported_user_id)
            VALUES ($1, $2)
            ON CONFLICT (reporting_user_id, reported_user_id) DO NOTHING
            RETURNING id;
        `;
        const result = await client.query(insertReportQuery, [reportingUserId, reportedUserId]);

        if (result.rowCount === 0) {
            await client.query('COMMIT');
            return;
        }

        const updateCountQuery = `
            UPDATE "user"
            SET fake_account_reports_count = fake_account_reports_count + 1
            WHERE id = $1;
        `;
        await client.query(updateCountQuery, [reportedUserId]);

        const deleteUserQuery = `
            DELETE FROM "user"
            WHERE id = $1 AND fake_account_reports_count = 10;
        `;
        await client.query(deleteUserQuery, [reportedUserId]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error reporting user:', err);
        throw new Error('Failed to report user');
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function likeProfileService(likingUserId: number, likedUserId: number) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const insertLikeQuery = `
            INSERT INTO user_likes (liking_user_id, liked_user_id)
            VALUES ($1, $2)
            ON CONFLICT (liking_user_id, liked_user_id) DO NOTHING
            RETURNING id;
        `;
        const insertResult = await client.query(insertLikeQuery, [likingUserId, likedUserId]);

        if (insertResult.rows.length > 0) {
            const updateLikesCountQuery = `
                UPDATE "user"
                SET likes_count = likes_count + 1
                WHERE id = $1
            `;
            await client.query(updateLikesCountQuery, [likedUserId]);

            const calculateFameRatingQuery = `
                UPDATE "user"
                SET fame_rating = CASE
                    WHEN likes_count = 1 THEN 2
                    WHEN likes_count >= 10 AND likes_count < 100 THEN 3
                    WHEN likes_count >= 100 AND likes_count < 1000 THEN 4
                    WHEN likes_count >= 1000 THEN 5
                    ELSE 1
                END
                WHERE id = $1
            `;
            await client.query(calculateFameRatingQuery, [likedUserId]);
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error liking user:', err);
        throw new Error('Failed to like user');
    } finally {
        client.release();
    }
}

export async function unlikeProfileService(likingUserId: number, likedUserId: number) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const deleteLikeQuery = `
            DELETE FROM user_likes 
            WHERE liking_user_id = $1 AND liked_user_id = $2
            RETURNING id;
        `;
        const deleteResult = await client.query(deleteLikeQuery, [likingUserId, likedUserId]);

        if (deleteResult.rows.length === 0) {
            return ;
        }

        const updateLikesCountQuery = `
            UPDATE "user"
            SET likes_count = likes_count - 1
            WHERE id = $1 AND likes_count > 0
        `;
        await client.query(updateLikesCountQuery, [likedUserId]);

        const calculateFameRatingQuery = `
            UPDATE "user"
            SET fame_rating = CASE
            WHEN likes_count = 0 THEN 1
            WHEN likes_count = 1 THEN 2
            WHEN likes_count >= 10 AND likes_count < 100 THEN 3
            WHEN likes_count >= 100 AND likes_count < 1000 THEN 4
            WHEN likes_count >= 1000 THEN 5
            ELSE 1
            END
            WHERE id = $1
        `;
        await client.query(calculateFameRatingQuery, [likedUserId]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error unliking user:', err);
        throw new Error('Failed to unlike user');
    } finally {
        client.release();
    }
}

export async function isBlockedService(blockingUserId: number, blockedUserId: number) {
    const client = await pool.connect();

    try {
        const query = `
            SELECT id 
            FROM blocked_users 
            WHERE blocking_user_id = $1 AND blocked_user_id = $2
        `;
        const result = await client.query(query, [blockingUserId, blockedUserId]);

        return result.rows.length > 0;
    } catch (err) {
        console.error('Error checking block status:', err);
        throw new Error('Failed to check block status');
    } finally {
        client.release();
    }
}
