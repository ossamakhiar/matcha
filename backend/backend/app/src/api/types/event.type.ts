
export type EventStatus = "proposed" | "accepted" | "declined" | "cancelled"

// this type for the scheduled events between two users
export type UserEvent = {
    id: number,
    title: string,
    eventDate: string,
    eventStatus?: EventStatus,
    notes?: string,
    creatorId: number,
    createdAt: string
}

export type CreateUserEvent = Omit<UserEvent, "createdAt" | "id">
