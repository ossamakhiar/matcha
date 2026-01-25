import { FC } from 'react';
import { ScheduledEvent, EventActionHandlers } from './types';
import { EventCard } from './EventCard';

type Props = {
    events: ScheduledEvent[];
    filter: string;
    actionHandlers: EventActionHandlers;
};

export const EventsList: FC<Props> = ({ events, filter, actionHandlers }) => {
    const getEmptyMessage = () => {
        switch (filter) {
            case 'upcoming':
                return "No upcoming events found. Time to propose a date!";
            case 'past':
                return "No past events found. Start making memories!";
            case 'all':
                return "No events scheduled yet. Get out there and meet someone!";
            default:
                return "No events found.";
        }
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">{getEmptyMessage()}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map(event => (
                <EventCard key={event.id} event={event} actionHandlers={actionHandlers} />
            ))}
        </div>
    );
};
