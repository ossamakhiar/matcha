import pool from "../model/pgPoolConfig.js";
import { compareDataWithSaltService, hashDataWithSaltService } from "./hashing.js";

export async function loginVerificationService(username: string, password: string) {
    let client;

    try {
        let ret = [undefined, false];
        client = await pool.connect();

        const query = `SELECT id, password, password_salt, is_verified, is_profile_complete FROM "user" WHERE username = $1;`;
        const result = await client.query(query, [username]);

        if (result.rows.length === 0) {
            // console.log("no results");

            return ([undefined, false]);
        }

        const user = result.rows[0];

        if (!user.is_verified) {
            // console.log("not verified");
            return ([undefined, false]);
        }

        if (!await compareDataWithSaltService(password, user.password, user.password_salt)) {
            // console.log("invalid password");
            return ([undefined, false]);
        }
        // console.log(user);
        return ([user.id, user.is_profile_complete]);
    }
    catch (err) {
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function emailValidationService(email: string) {
    let client;

    try {
        client = await pool.connect();
        const query = `SELECT id FROM "user" WHERE email=$1;`

        const result = await client.query(query, [email]);

        return (result.rows.length > 0 ? result.rows[0].id : undefined);
    }
    catch (err) {
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

// Function to save the password reset token in the database
export async function saveResetPasswordTokenService(userId: number, resetToken: string): Promise<void> {
    const client = await pool.connect();

    try {
        // Start a transaction
        await client.query('BEGIN');

        const deleteQuery = `DELETE FROM "password_reset" WHERE user_id = $1`;
        await client.query(deleteQuery, [userId]);

        const insertQuery = `INSERT INTO "password_reset" (user_id, token) VALUES ($1, $2)`;
        await client.query(insertQuery, [userId, resetToken]);

        await client.query('COMMIT');

        console.log(`Token for ${userId}: ${resetToken}`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function changePasswordService(token: string, newPassword: string) {
    let client;

    try {
        client = await pool.connect();

        await client.query('BEGIN');

        const findUserQuery = `SELECT user_id FROM "password_reset" WHERE token = $1;`;
        const userResult = await client.query(findUserQuery, [token]);

        if (userResult.rows.length === 0) {
            throw new Error('Invalid or expired token');
        }

        const userId = userResult.rows[0].user_id;
        const [hashedPassword, passwordSalt] = await hashDataWithSaltService(newPassword);
        const updatePasswordQuery = `UPDATE "user" SET password = $1, password_salt = $2 WHERE id = $3;`;
        await client.query(updatePasswordQuery, [hashedPassword, passwordSalt, userId]);

        const deleteTokenQuery = `DELETE FROM "password_reset" WHERE token = $1;`;
        await client.query(deleteTokenQuery, [token]);

        await client.query('COMMIT')

        return (userId);
    } catch (err) {
        if (client) {
            await client.query('ROLLBACK');
        }
        throw new Error('Error changing password');
    } finally {
        if (client) {
            client.release();
        }
    }
}
