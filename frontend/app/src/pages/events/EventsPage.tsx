import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendLoggedInActionRequest } from "../../utils/httpRequests";
import { FaList, FaCalendarAlt } from "react-icons/fa";
import { ScheduledEvent, ViewMode, FilterType, EventActionHandlers } from "./types";
import { filterEvents, calculateEventCounts } from "./utils";
import { EventsList } from "./EventsList";
import { EventsCalendar } from "./EventsCalendar";
import { EditEventModal } from "./EditEventModal";
import { useSocket } from "../../context/SocketProvider";
import { EventsEnum } from "../../types/EventsEnum";
import { toast } from "../../utils/toast";

const EventsPage = () => {
    const [events, setEvents] = useState<ScheduledEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>("upcoming");
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null);
    const navigate = useNavigate();
    const socket = useSocket();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await sendLoggedInActionRequest('GET', `${import.meta.env.VITE_API_URL}/events`);
            const eventsData = Array.isArray(response.data) ? response.data : response;
            setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch (error) {
            toast.error('Failed to fetch events');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEventResponse = async (eventId: number, action: 'accept' | 'decline' | 'cancel') => {
        try {
            if (socket) {
                socket.emit(EventsEnum.EVENT_RESPOND, { eventId, action });
                // Optimistic update
                setEvents(prevEvents => 
                    prevEvents.map(event => 
                        event.id === eventId 
                            ? { ...event, eventStatus: action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'cancelled' }
                            : event
                    )
                );
                toast.success(`Event ${action}ed successfully`);
            }
        } catch (error) {
            toast.error(`Failed to ${action} event`);
        }
    };

    const handleEditEvent = async (eventId: number, updates: { title: string; eventDate: string; notes?: string }) => {
        try {
            await sendLoggedInActionRequest('PATCH', `${import.meta.env.VITE_API_URL}/events/${eventId}`, updates);
            await fetchEvents();
            toast.success('Event updated successfully');
        } catch (error) {
            toast.error('Failed to update event');
        }
    };

    const actionHandlers: EventActionHandlers = {
        onAccept: (eventId) => handleEventResponse(eventId, 'accept'),
        onDecline: (eventId) => handleEventResponse(eventId, 'decline'),
        onCancel: (eventId) => handleEventResponse(eventId, 'cancel'),
        onEdit: (event) => setEditingEvent(event),
        onGoToChat: (partnerId) => navigate(`/chat/${partnerId}`),
    };

    useEffect(() => {
        if (socket) {
            socket.on(EventsEnum.EVENT_STATUS_UPDATE, (data: { eventId: number; eventStatus: string }) => {
                setEvents(prevEvents => 
                    prevEvents.map(event => 
                        event.id === data.eventId 
                            ? { ...event, eventStatus: data.eventStatus as any }
                            : event
                    )
                );
            });

            return () => {
                socket.off(EventsEnum.EVENT_STATUS_UPDATE);
            };
        }
    }, [socket]);

    const filteredEvents = filterEvents(events, filter);
    const { upcomingCount, pastCount } = calculateEventCounts(events);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg text-gray-600">Loading events...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
                            <p className="text-gray-600">View and manage your event proposals</p>
                        </div>
                        
                        {/* View Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewMode === "list"
                                        ? "bg-white shadow-sm text-pink"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <FaList />
                                <span className="text-sm font-medium">List</span>
                            </button>
                            <button
                                onClick={() => setViewMode("calendar")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                                    viewMode === "calendar"
                                        ? "bg-white shadow-sm text-pink"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <FaCalendarAlt />
                                <span className="text-sm font-medium">Calendar</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setFilter("upcoming")}
                        className={`pb-3 px-4 text-sm font-medium transition-colors ${
                            filter === "upcoming"
                                ? "border-b-2 border-pink text-pink"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Upcoming ({upcomingCount})
                    </button>
                    <button
                        onClick={() => setFilter("past")}
                        className={`pb-3 px-4 text-sm font-medium transition-colors ${
                            filter === "past"
                                ? "border-b-2 border-pink text-pink"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Past ({pastCount})
                    </button>
                    <button
                        onClick={() => setFilter("all")}
                        className={`pb-3 px-4 text-sm font-medium transition-colors ${
                            filter === "all"
                                ? "border-b-2 border-pink text-pink"
                                : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        All ({events.length})
                    </button>
                </div>

                {/* Events List or Calendar */}
                {viewMode === "list" ? (
                    <EventsList events={filteredEvents} filter={filter} actionHandlers={actionHandlers} />
                ) : (
                    <EventsCalendar events={filteredEvents} actionHandlers={actionHandlers} />
                )}

                {/* Edit Modal */}
                {editingEvent && (
                    <EditEventModal
                        event={editingEvent}
                        isOpen={!!editingEvent}
                        onClose={() => setEditingEvent(null)}
                        onSave={handleEditEvent}
                    />
                )}
            </div>
        </div>
    );
};

export default EventsPage;
