import pool from "../model/pgPoolConfig.js";
import { CreateUserEvent, UserEvent, EventStatus } from "../types/event.type.js";
import { ApplicationError } from "../helpers/ApplicationError.js";


export async function createEvent(event: CreateUserEvent): Promise<UserEvent> {
    const   eventCreateQuery = `INSERT INTO "event"
                                (creator_id, title, event_date, notes) values ($1, $2, $3, $4)
                                RETURNING id, creator_id, title, event_date, event_status, notes, created_at;`

    const dbClient = await pool.connect();

    try {
        const results = await dbClient.query(
            eventCreateQuery,
            [event.creatorId, event.title, event.eventDate, event.notes]
        );
        const insertedRow = results.rows[0];

        return ({
            id: insertedRow.id,
            creatorId: insertedRow.creator_id,
            title: insertedRow.title,
            eventDate: insertedRow.event_date,
            notes: insertedRow.notes,
            createdAt: insertedRow.created_at,
            eventStatus: insertedRow.event_status,
            canRespond: false
        });
    } catch (e) {
        throw (e);
    } finally {
        dbClient.release();
    }
}

export async function getEventById(eventId: number): Promise<UserEvent | null> {
    const query = `SELECT id, creator_id, title, event_date, event_status, notes, created_at
                   FROM "event"
                   WHERE id = $1;`;

    const dbClient = await pool.connect();

    try {
        const results = await dbClient.query(query, [eventId]);
        
        if (results.rows.length === 0) {
            return null;
        }

        const row = results.rows[0];
        return {
            id: row.id,
            creatorId: row.creator_id,
            title: row.title,
            eventDate: row.event_date,
            notes: row.notes,
            createdAt: row.created_at,
            eventStatus: row.event_status,
            canRespond: false
        };
    } catch (e) {
        throw e;
    } finally {
        dbClient.release();
    }
}

/**
 * Get all events for a user (both created by them and received)
 */
export async function getUserEvents(userId: number): Promise<any[]> {
    const query = `
        SELECT 
            e.id,
            e.creator_id,
            e.title,
            e.event_date,
            e.event_status,
            e.notes,
            e.created_at,
            d.sender_id,
            d.receiver_id,
            u.id as partner_id,
            u.first_name,
            u.last_name,
            u.profile_picture
        FROM "event" e
        JOIN "dm" d ON d.event_id = e.id
        JOIN "user" u ON u.id = CASE 
            WHEN d.sender_id = $1 THEN d.receiver_id 
            ELSE d.sender_id 
        END
        WHERE (d.sender_id = $1 OR d.receiver_id = $1)
        ORDER BY e.event_date DESC;
    `;

    const dbClient = await pool.connect();
    try {
        const results = await dbClient.query(query, [userId]);
        
        return results.rows.map(row => ({
            id: row.id,
            creatorId: row.creator_id,
            title: row.title,
            eventDate: row.event_date,
            eventStatus: row.event_status,
            notes: row.notes,
            createdAt: row.created_at,
            isCreator: row.creator_id === userId,
            partner: {
                id: row.partner_id,
                firstName: row.first_name,
                lastName: row.last_name,
                profilePicture: row.profile_picture 
                    ? `${process.env.BASE_URL}/${row.profile_picture}` 
                    : process.env.DEFAULT_PROFILE_PICTURE
            }
        }));
    } catch (e) {
        throw e;
    } finally {
        dbClient.release();
    }
}


export async function validateUsersMatched(userId1: number, userId2: number): Promise<boolean> {
    const query = `SELECT CASE WHEN COUNT(*) = 2 THEN true ELSE false END AS are_matched
                   FROM user_likes
                   WHERE (liking_user_id, liked_user_id) IN (($1, $2), ($2, $1));`;

    const dbClient = await pool.connect();
    try {
        const results = await dbClient.query(query, [userId1, userId2]);
        return (results.rowCount != null && results.rowCount > 0 && results.rows[0].are_matched === true);
    } catch (e) {
        throw e;
    } finally {
        dbClient.release();
    }
}

export async function updateEventStatus(
    eventId: number,
    newStatus: EventStatus,
    userId: number
): Promise<UserEvent> {
    const dbClient = await pool.connect();

    try {
        await dbClient.query('BEGIN');

        const eventQuery = `
            SELECT 
                e.id,
                e.creator_id,
                e.title,
                e.event_date,
                e.event_status,
                e.notes,
                e.created_at,
                d.sender_id,
                d.receiver_id
            FROM "event" e
            JOIN "dm" d ON d.event_id = e.id
            WHERE e.id = $1;
        `;

        const eventResult = await dbClient.query(eventQuery, [eventId]);

        if (eventResult.rows.length === 0) {
            throw new ApplicationError('Event not found');
        }

        const event = eventResult.rows[0];
        const currentStatus = event.event_status;
        const senderId = event.sender_id;
        const receiverId = event.receiver_id;

        const areMatched = await validateUsersMatched(senderId, receiverId);
        if (!areMatched) {
            throw new ApplicationError('Users are no longer matched');
        }

        if (currentStatus !== 'proposed') {
            throw new ApplicationError(`Cannot update event with status: ${currentStatus}`);
        }

        if (newStatus === 'cancelled') {
            if (event.creator_id !== userId) {
                throw new ApplicationError('Only the event creator can cancel this event');
            }
        } else if (newStatus === 'accepted' || newStatus === 'declined') {
            if (receiverId !== userId) {
                throw new ApplicationError('Only the event receiver can respond to this event');
            }
        }

        const updateQuery = `
            UPDATE "event"
            SET event_status = $1
            WHERE id = $2
            RETURNING id, creator_id, title, event_date, event_status, notes, created_at;
        `;

        const updateResult = await dbClient.query(updateQuery, [newStatus, eventId]);
        const updatedRow = updateResult.rows[0];

        await dbClient.query('COMMIT');

        return {
            id: updatedRow.id,
            creatorId: updatedRow.creator_id,
            title: updatedRow.title,
            eventDate: updatedRow.event_date,
            notes: updatedRow.notes,
            createdAt: updatedRow.created_at,
            eventStatus: updatedRow.event_status,
            canRespond: false
        };
    } catch (e) {
        await dbClient.query('ROLLBACK');
        throw e;
    } finally {
        dbClient.release();
    }
}

export async function updateEvent(
    eventId: number,
    updates: { title?: string; eventDate?: string; notes?: string }
): Promise<UserEvent> {
    const dbClient = await pool.connect();

    try {
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (updates.title !== undefined) {
            updateFields.push(`title = $${paramIndex++}`);
            updateValues.push(updates.title);
        }
        if (updates.eventDate !== undefined) {
            updateFields.push(`event_date = $${paramIndex++}`);
            updateValues.push(updates.eventDate);
        }
        if (updates.notes !== undefined) {
            updateFields.push(`notes = $${paramIndex++}`);
            updateValues.push(updates.notes);
        }

        if (updateFields.length === 0) {
            throw new ApplicationError('No fields to update');
        }

        updateValues.push(eventId);

        const updateQuery = `
            UPDATE "event"
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id, creator_id, title, event_date, event_status, notes, created_at;
        `;

        const result = await dbClient.query(updateQuery, updateValues);

        if (result.rows.length === 0) {
            throw new ApplicationError('Event not found');
        }

        const updatedRow = result.rows[0];

        return {
            id: updatedRow.id,
            creatorId: updatedRow.creator_id,
            title: updatedRow.title,
            eventDate: updatedRow.event_date,
            notes: updatedRow.notes,
            createdAt: updatedRow.created_at,
            eventStatus: updatedRow.event_status,
            canRespond: false
        };
    } catch (e) {
        throw e;
    } finally {
        dbClient.release();
    }
}