import { Request, Response } from "express";
import { getUserEvents, getEventById, updateEvent } from "../services/event.service.js";
import { ApplicationError } from "../helpers/ApplicationError.js";

export async function getEventsController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const events = await getUserEvents(userId);
        
        return res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateEventController(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const eventId = parseInt(req.params.eventId);
        const { title, eventDate, notes } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!eventId || isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }

        // Verify the user is the creator
        const event = await getEventById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.creatorId !== userId) {
            return res.status(403).json({ error: 'Only the event creator can edit this event' });
        }

        if (event.eventStatus !== 'proposed') {
            return res.status(400).json({ error: 'Cannot edit an event that is not in proposed status' });
        }

        // Update the event
        const updatedEvent = await updateEvent(eventId, { title, eventDate, notes });
        return res.status(200).json(updatedEvent);
    } catch (error) {
        if (error instanceof ApplicationError) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Error updating event:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
