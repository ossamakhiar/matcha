import dotenv from 'dotenv'
import { updateProfilePersonalInfos } from '../types/profile.js';
import pool from '../model/pgPoolConfig.js';

dotenv.config();

export async function addUserPhotosService(userId: number, imageUrls: string[]) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const photoValues = imageUrls.map((url, i) => `($1, $${i + 2})`).join(', ');
        const insertPhotosQuery = `
            INSERT INTO user_photo (user_id, photo)
            VALUES ${photoValues}
        `;

        const values = [userId, ...imageUrls];

        await client.query(insertPhotosQuery, values);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding user photos:', err);
        throw new Error('Failed to add user photos');
    } finally {
        client.release();
    }
}

export async function updatePersonalInfosService(userId: number, profileInfos: updateProfilePersonalInfos) {
    let client;

    try {
        const query = `UPDATE "user" SET
            first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            age = COALESCE($3, age),
            biography = COALESCE($4, biography),
            gender = COALESCE($5, gender),
            sexual_preference = COALESCE($6, sexual_preference),
            username = COALESCE($7, username),
            profile_picture = COALESCE($8, profile_picture)
            WHERE id = $9;`;
        client = await pool.connect();

        await client.query(query, [profileInfos.firstname, profileInfos.lastname,
        profileInfos.age, profileInfos.biography, profileInfos.gender,
        profileInfos.sexualPreference, profileInfos.username,
        profileInfos.profilePicturePath,
            userId
        ])
    }
    catch (err) {

    } finally {

    }
}

export async function setProfileAsCompleteService(userId: number) {
    let client;

    try {
        client = await pool.connect();
        const query = `UPDATE "user" 
                    SET is_profile_complete = TRUE 
                    WHERE id = $1;`;

        await client.query(query, [userId]);

    }
    catch (err) {
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}


export async function updateUserLocation(userId: number, coords: any) {
    let client;

    try {
        client = await pool.connect();
        const query = `UPDATE "user" SET
                    latitude = $1,
                    longitude = $2
                    WHERE id = $3;`;

        await client.query(query, [coords.latitude, coords.longitude, userId]);
    }
    catch (err) {
        throw err;
    } finally {
        client && client.release();
    }
}
