export type Partner = {
    id: number;
    firstName: string;
    lastName: string;
    profilePicture: string;
};

export type EventStatus = "proposed" | "accepted" | "declined" | "cancelled";

export type ScheduledEvent = {
    id: number;
    creatorId: number;
    title: string;
    eventDate: string;
    eventStatus: EventStatus;
    notes?: string;
    createdAt: string;
    isCreator: boolean;
    partner: Partner;
};

export type ViewMode = "list" | "calendar";

export type FilterType = "all" | "upcoming" | "past";

export type EventAction = "accept" | "decline" | "cancel";

export type EventActionHandlers = {
    onAccept: (eventId: number) => void;
    onDecline: (eventId: number) => void;
    onCancel: (eventId: number) => void;
    onEdit: (event: ScheduledEvent) => void;
    onGoToChat: (partnerId: number) => void;
};
