import pool from "../model/pgPoolConfig.js";
import { CreateUserEvent, UserEvent } from "../types/event.type.js";


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
            eventStatus: insertedRow.event_status
        });
    } catch (e) {
        throw (e);
    } finally {
        dbClient.release();
    }
}