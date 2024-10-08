import pool from "../model/pgPoolConfig.js";

export async function checkIfUserAlreadyRegistered(email: string, username: string): Promise<string> {
    let client;

    try {
        let field = '';
        const query = `SELECT username, email FROM "user" 
            WHERE username = $1 OR email = $2;`

        client = await pool.connect();
        const result = await client.query(query, [username, email]);

        if (result.rows.length > 0) {
            field = result.rows[0].email === email ? 'email' : 'username';
        }

        return (field);
    }
    catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function saveUserSignUpCredentialsService(email: string, username: string, firstname: string, lastname: string, hashedPassword: string, passwordSalt: string) {
    // create a new record in user table
    let client;

    try {
        client = await pool.connect();
        const query = `
            INSERT INTO "user" (username, email, first_name, last_name, password, password_salt)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id;
        `;

        const results = await client.query(query, [
            username,
            email,
            firstname,
            lastname,
            hashedPassword,
            passwordSalt,
        ]);

        if (results.rows.length === 0) {
            throw new Error(`failed to register user!!`);
        }

        return (results.rows[0].id);
    }
    catch (err) {
        console.log(err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function saveEmailVerificationTokenService(verificationToken: string, userId: number): Promise<void> {
    let client;

    try {
        client = await pool.connect();
        const query = `
            INSERT INTO "email_verification" (user_id, token)
            VALUES ($1, $2);
        `;

        await client.query(query, [
            userId,
            verificationToken
        ]);

    }
    catch (err) {
        console.log(err);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

// Consumes the email verification token, verifies the user, and deletes the token
export async function userVerificationService(verificationToken: string): Promise<number | undefined> {
    let client;

    try {
        let userId: number | undefined = undefined;

        client = await pool.connect();

        // Start a transaction
        await client.query('BEGIN');

        try {
            // Query to find the user associated with the verification token
            const query = `SELECT user_id FROM "email_verification" 
                WHERE token = $1;`;
            const result = await client.query(query, [verificationToken]);

            if (result.rows.length > 0) {
                userId = result.rows[0].user_id;

                // Update the user record to set is_verified to true
                const updateUserQuery = `UPDATE "user" 
                    SET is_verified = TRUE 
                    WHERE id = $1;`;
                await client.query(updateUserQuery, [userId]);

                // Delete the verification record
                const deleteQuery = `DELETE FROM "email_verification" 
                    WHERE token = $1;`;
                await client.query(deleteQuery, [verificationToken]);

                await client.query('COMMIT');
            } else {
                await client.query('ROLLBACK');
            }
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }

        return userId;
    } catch (err) {
        console.error(err);
        throw new Error('Database error');
    } finally {
        if (client) {
            client.release();
        }
    }
}
