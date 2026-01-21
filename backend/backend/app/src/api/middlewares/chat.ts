import { NextFunction, Request, Response } from 'express';
import { isIdValid } from '../validators/generalValidators.js';

// ! think about this, it gonna be called every time a request come
// async function checkUserExistence(userId: number): Promise<boolean> {
//     const client = await pool.connect();
//     const query = `SELECT COUNT(*) AS count FROM "user" WHERE id = $1`;

//     try {
//         const result = await client.query(query, [userId]);
//         return result.rows[0].count > 0;
//     } catch (e) {
//         throw e;
//     } finally {
//         client.release();
//     }
// }



export async function validateDmParam(request: Request, response: Response, next: NextFunction) {
    const userId = request.params.userId;

    if (!userId || !isIdValid(userId)) {
        response.status(400).json({status: 400, message: 'invalid user id'});
        return ;
    }

    next();
}

export async function validateUserIdBody(request: Request, response: Response, next: NextFunction) {
    const userId = request.body.userId;
    // console.log(request.body);

    if (!userId || typeof userId != 'number') {
        response.status(400).json({status: 400, message: 'invalid user id'});
        return ;
    }

    next();
}
