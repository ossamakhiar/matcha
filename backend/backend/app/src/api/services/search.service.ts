import pool from "../model/pgPoolConfig.js";
import { UserInfo } from "../types/profile.js";



// ! should i return the user himself who requested the search if the its info matchs the search query? id <> $1
export async function getSearchResultService(userId: number, searchQueryStr: string, page: number, pageSize: number): Promise<UserInfo[]> {
    const client = await pool.connect();
    const searchQuery = `
                    SELECT
                        u.id,
                        u.username,
                        u.first_name,
                        u.last_name,
                        u.profile_picture,
                        u.longitude,
                        u.latitude,
                        u.gender,
                        u.age,
                        u.sexual_preference,
                        u.biography,
                        u.fame_rating,
                        u.id = $1 as is_self,
                        ul.id IS NOT NULL AS is_liked,
                        ul2.id IS NOT NULL AS is_liking
                    FROM "user" u
                    LEFT JOIN "user_likes" ul
                        ON ul.liked_user_id = u.id AND ul.liking_user_id = $1
                    LEFT JOIN "user_likes" ul2
                        ON ul2.liked_user_id = $1 AND ul2.liking_user_id = u.id
                    WHERE
                        u.is_verified = true
                        AND (
                            u.username ILIKE '%' || $2 || '%'
                            OR u.first_name || ' ' || u.last_name ILIKE '%' || $2 || '%'
                        )
                        AND u.id not in (
                            SELECT
                                CASE
                                    WHEN blocked_user_id = $1 THEN blocking_user_id
                                    ELSE blocked_user_id
                                END AS id
                            FROM "blocked_users"
                            WHERE blocked_user_id = $1 OR blocking_user_id = $1
                        )
                    ORDER BY u.username, u.first_name, u.last_name
                    LIMIT $3
                    OFFSET $4
                `;

    try {
        const searchResults = await client.query(searchQuery, [userId, searchQueryStr, pageSize, page * pageSize]);


        return (searchResults.rows.map((result) => {
            const profilePicture = result.profile_picture ? process.env.BASE_URL as string + '/' + result.profile_picture : process.env.DEFAULT_PROFILE_PICTURE as string;
            return {
                id: result.id,
                userName: result.username,
                firstName: result.first_name,
                lastName: result.last_name,
                gender: result.gender,
                profilePicture: profilePicture,
                longitude: Number(result.longitude),
                latitude: Number(result.latitude),
                isSelf: result.is_self,
                isLiked: result.is_liked,
                isLiking: result.is_liking,
                sexualPreferences: result.sexual_preference,
                age: result.age,
                biography: result.biography,
                fameRating: result.fame_rating,
            }
        }));
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}



/*
    same performance
                    SELECT
                        id,
                        username,
                        first_name,
                        last_name,
                        profile_picture,
                        gender,
                        CASE WHEN id = $1 THEN true ELSE false END as is_self,
                        CASE
                            WHEN id <> $1
                            AND EXISTS (
                                SELECT 1 
                                FROM "user_likes"
                                WHERE liking_user_id = $1 AND liked_user_id = id
                            )
                        THEN true ELSE false END as is_liked,
                        CASE
                            WHEN id <> $1
                            AND NOT EXISTS (
                                    SELECT 1
                                    FROM "user_likes"
                                    WHERE liking_user_id = id AND liked_user_id = $1
                            )
                        THEN true ELSE false END as is_liking
                    FROM "user"
                    WHERE
                        (
                            username ILIKE '%' || $2 || '%'
                            OR first_name || ' ' || last_name ILIKE '%' || $2 || '%'
                        )
                        AND id not in (
                            SELECT
                                CASE
                                    WHEN blocked_user = $1 THEN blocking_user
                                    ELSE blocked_user_id
                                END AS id
                            FROM "blocked_users"
                            WHERE blocked_user_id = $1 OR blocking_user_id = $1
                        )
                    LIMIT $3
                    OFFSET $4
*/