import { ScheduledEvent, FilterType } from "./types";

export const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' })
    };
};

export const filterEvents = (events: ScheduledEvent[], filter: FilterType): ScheduledEvent[] => {
    if (!events || !Array.isArray(events)) {
        return [];
    }
    
    const now = new Date();
    
    if (filter === "upcoming") {
        return events.filter(e => 
            new Date(e.eventDate) >= now && 
            (e.eventStatus === "proposed" || e.eventStatus === "accepted")
        );
    } else if (filter === "past") {
        return events.filter(e => 
            new Date(e.eventDate) < now || 
            e.eventStatus === "declined" || 
            e.eventStatus === "cancelled"
        );
    }
    return events;
};

export const getStatusBadgeClass = (status: string): string => {
    const styles = {
        proposed: "bg-yellow-100 text-yellow-700",
        accepted: "bg-green-100 text-green-700",
        declined: "bg-red-100 text-red-700",
        cancelled: "bg-orange-100 text-orange-700"
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-600";
};

export const calculateEventCounts = (events: ScheduledEvent[]) => {
    const now = new Date();
    
    const upcomingCount = events.filter(e => 
        new Date(e.eventDate) >= now && 
        (e.eventStatus === "proposed" || e.eventStatus === "accepted")
    ).length;

    const pastCount = events.filter(e => 
        new Date(e.eventDate) < now || 
        e.eventStatus === "declined" || 
        e.eventStatus === "cancelled"
    ).length;

    return { upcomingCount, pastCount };
};
