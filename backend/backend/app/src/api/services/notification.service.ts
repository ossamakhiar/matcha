import { Socket } from "socket.io";
import { emitNotificationEvent, extractUserId } from "./socket.service.js";
import { isValidUserEventData } from "../validators/socketEventValidator.js";
import { IUserBrief, UserEventData } from "../types/chat.type.js";
import { ApplicationError } from "../helpers/ApplicationError.js";
import { NotificationTypesEnum } from "../types/enums.js";
import pool from "../model/pgPoolConfig.js";
import { INotification } from "../types/notification.type.js";
import { isBlockedService } from "./profile.js";
import { getUserBrief, substituteActorInNotificationDesc } from "./helper.service.js";
// import { areMatched } from "./chat.service.js";


// function validateAndExtractUserId(client: Socket, data: UserEventData): { userId: number; targetUserId: number } {
//     if (!isValidUserEventData(data)) {
//         throw new ApplicationError('Invalid event data');
//     }
//     const userId = extractUserId(client);
//     const targetUserId = data.targetUserId;
//     return { userId, targetUserId };
// }



export async function    profileVisitNotificationHandler(client: Socket, data: UserEventData) {
    // validate data object
    if (!isValidUserEventData(data))
        throw new ApplicationError('Invalid visit event data')

    const   userId = extractUserId(client);
    const   visitedProfileId = data.targetUserId;

    if (visitedProfileId === userId)
        return ;
    if (await isBlockedService(visitedProfileId, userId))
        throw new ApplicationError('forbidden: you cannot do this action on this user');

    const   userBrief = await getUserBrief(userId);
    // Latter defining where to add it to the history. here or on an http endpoint
    const   notification: INotification = await createNewNotification(visitedProfileId, userBrief, NotificationTypesEnum.PROFILE_VISIT);

    emitNotificationEvent(visitedProfileId, notification);
}




export async function userUnlikedNotificationHandler(client: Socket, data: UserEventData) {
    // validate data object
    if (!isValidUserEventData(data))
        throw new ApplicationError('Invalid visit event data')

    const   userId = extractUserId(client);
    const   unlikedUserId = data.targetUserId as number;

    if (unlikedUserId === userId) // !! or unlikeduserId doesn't exists or if the user has not previously liked the unlikedUserId
        return ;
    
    if (await isBlockedService(unlikedUserId, userId))
        throw new ApplicationError('forbidden: you cannot do this action on this user');

    const   userBrief = await getUserBrief(userId);
    const   notification: INotification = await createNewNotification(unlikedUserId, userBrief, NotificationTypesEnum.UNLIKE);

    emitNotificationEvent(unlikedUserId, notification);
}



export async function userLikeNotificationHandler(client: Socket, data: UserEventData) {
    // validate data, data should have the likedUserId.
    if (!isValidUserEventData(data))
        throw new ApplicationError('like handler: Invalid event data')

    const   userId = extractUserId(client);
    const   likedUserId = data.targetUserId;


    if (userId === likedUserId) { // or pairs already matched
        return ;
    }

    if (await isBlockedService(likedUserId, userId))
        throw new ApplicationError('forbidden: you cannot do this action on this user');

    // * there is a problem when this function get triggered without perfoming
    // * any checks like if they are already matched it will create a new record in the database
    // * and it gonna be multiple rows saying the same thing
    // * i don't know if i should handle that here, but i find out that when this function get triggered the
    // * post request will be already made and the likes record exists in the DB (maybe they are matched)

    const   userBrief = await getUserBrief(userId);
    const notification: INotification = await createNewNotification(likedUserId, userBrief, NotificationTypesEnum.LIKE);
    emitNotificationEvent(likedUserId, notification);
}









// ? ====== HELPER FUNCTION ======
export async function getNotificationDetailsByType(notificationType: string) {
    const   client = await pool.connect();
    
    const query = `SELECT id, title, type, description
                FROM "notification_types"
                WHERE type = $1;
    `
    let notificationDetails : {id: number, title: string, type: string, description: string};

    try {
        const results = await client.query(query, [notificationType])
    
        if (results.rowCount === 0)
            throw new ApplicationError('notificaiton type not found');

        notificationDetails = results.rows[0];
        return (notificationDetails);
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}

export async function createNewNotification(notifierId: number, actorUser: IUserBrief, notificationType: string): Promise<INotification> {
    const query = `INSERT INTO "notifications"
                    (actor_id, notifier_id, notification_type_id)
                    VALUES ($1, $2, $3)
                    RETURNING id, created_at;
                `

    const notificationDetails = await getNotificationDetailsByType(notificationType);
    const   client = await pool.connect();

    try {
        const notificationResult = await client.query(query, [actorUser.id, notifierId, notificationDetails.id]);
        const createdNotification = notificationResult.rows[0];

        return {
            id: createdNotification.id as number,
            type: notificationDetails.type as string,
            title: notificationDetails.title as string,
            message: substituteActorInNotificationDesc(notificationDetails.description, `${actorUser.firstName} ${actorUser.lastName}`),
            actorId: actorUser.id,
            profilePicture: actorUser.profilePicture,
            firstName: actorUser.firstName,
            lastName: actorUser.lastName,
            notificationStatus: false,
            createdAt: new Date(notificationResult.rows[0].created_at).toISOString()
        };

    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}









// ? HTTP Services
// SORT NOTIFICATION BY the creatation time
// ! adding pagination feature
export async function retrieveNotifications(userId: number, page: number, pageSize: number): Promise<INotification[]> {

    /*
        id: number;
    type: string;
    title: string;
    message: string;
    actorId: number;
    profilePicture: string;
    firstName: string;
    lastName: string;
    notificationStatus: boolean; // read (true)/unread
    */
    // select all the notification of the userId and count the unseen notifications
    const   query = `
            SELECT
                n.id,
                n.actor_id,
                u.first_name,
                u.last_name,
                u.profile_picture,
                nt.type,
                nt.title,
                nt.description,
                n.status,
                n.created_at
            FROM "notifications" n
            JOIN "notification_types" nt
                ON n.notification_type_id = nt.id
            JOIN "user" u
                ON u.id = n.actor_id
            WHERE notifier_id = $1
            ORDER BY n.created_at DESC
            LIMIT $2
            OFFSET $3;
        `;
        // ORDER BY n.created_at DESC
        
    const offset = page * pageSize;
    const limit = pageSize;

    const client = await pool.connect();

    let   results;
    try {
        results = await client.query(query, [userId, limit, offset]);
    } catch (e) {
        throw (e);
    } finally {
        client.release();
    }

    const mappedResults: INotification[] = results.rows.map((notification) => {
        const profilePicture = notification.profile_picture ? process.env.BASE_URL as string + '/' + notification.profile_picture : process.env.DEFAULT_PROFILE_PICTURE as string;

            return ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: substituteActorInNotificationDesc(notification.description, `${notification.first_name} ${notification.last_name}`),
            actorId: notification.actor_id,
            firstName: notification.first_name,
            lastName: notification.last_name,
            profilePicture: profilePicture,
            notificationStatus: notification.status,
            createdAt: new Date(notification.created_at).toISOString(),
        })
    })


    return (mappedResults);
}


export  async function notificationMarkAsReadService(userId: number) {
    const query = `
                UPDATE "notifications"
                SET status = true
                WHERE notifier_id = $1;
    `
    const   client = await pool.connect();

    try {
        await client.query(query, [userId]);
    } catch (e) {
        throw (e);
    } finally {
        client.release();
    }

}