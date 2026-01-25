import { FC, useState } from "react";
import { ScheduledEvent, EventActionHandlers } from "./types";
import { formatEventDate, getStatusBadgeClass } from "./utils";
import { FaChevronLeft, FaChevronRight, FaTimes, FaComments, FaCheck, FaBan, FaEdit } from 'react-icons/fa';

type Props = {
    events: ScheduledEvent[];
    actionHandlers: EventActionHandlers;
};

export const EventsCalendar: FC<Props> = ({ events, actionHandlers }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.eventDate);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
        const dayNumber = i - startingDayOfWeek + 1;
        const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
        const currentDate = isValidDay ? new Date(year, month, dayNumber) : null;
        const dayEvents = currentDate ? getEventsForDate(currentDate) : [];
        const isToday = currentDate?.toDateString() === new Date().toDateString();

        days.push(
            <div
                key={i}
                onClick={() => {
                    if (currentDate && dayEvents.length > 0) {
                        setSelectedDate(currentDate);
                        setSelectedEvent(null); // Reset selected event
                    }
                }}
                className={`min-h-[100px] border border-gray-200 p-2 ${
                    !isValidDay ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                } ${dayEvents.length > 0 ? 'cursor-pointer' : ''} ${
                    isToday ? 'ring-2 ring-pink' : ''
                }`}
            >
                {isValidDay && (
                    <>
                        <div className={`text-sm font-semibold mb-1 ${
                            isToday ? 'text-pink' : 'text-gray-700'
                        }`}>
                            {dayNumber}
                        </div>
                        <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                                <div
                                    key={event.id}
                                    className={`text-xs p-1 rounded truncate ${
                                        event.eventStatus === 'accepted'
                                            ? 'bg-green-100 text-green-700'
                                            : event.eventStatus === 'proposed'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : event.eventStatus === 'declined'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-orange-100 text-orange-700'
                                    }`}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500">
                                    +{dayEvents.length - 2} more
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaChevronLeft />
                </button>
                <h2 className="text-xl font-semibold">{monthName}</h2>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaChevronRight />
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-sm text-gray-600 p-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border border-gray-200">
                {days}
            </div>

            {/* Selected Date Events List */}
            {selectedDate && !selectedEvent && getEventsForDate(selectedDate).length > 0 && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            Events on {selectedDate.toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </h3>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {getEventsForDate(selectedDate).map(event => {
                            const { time } = formatEventDate(event.eventDate);
                            return (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                                >
                                    <div className="flex items-center space-x-3 flex-1">
                                        <img
                                            src={event.partner.profilePicture}
                                            alt={`${event.partner.firstName}`}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-pink"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                            <div className="text-sm text-gray-600">
                                                {time} • {event.partner.firstName} {event.partner.lastName}
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                            event.eventStatus
                                        )}`}
                                    >
                                        {event.eventStatus}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Event Detail View */}
            {selectedEvent && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start space-x-4">
                            <img
                                src={selectedEvent.partner.profilePicture}
                                alt={selectedEvent.partner.firstName}
                                className="w-16 h-16 rounded-full object-cover border-2 border-pink"
                            />
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedEvent.title}</h3>
                                <p className="text-sm text-gray-600">
                                    {selectedEvent.isCreator ? 'You proposed' : `Proposed by`}
                                    <span className="font-medium text-gray-900 ml-1">
                                        {selectedEvent.partner.firstName} {selectedEvent.partner.lastName}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {formatEventDate(selectedEvent.eventDate).date} at {formatEventDate(selectedEvent.eventDate).time}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setSelectedEvent(null);
                                setSelectedDate(null);
                            }} 
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {selectedEvent.notes && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 italic">"{selectedEvent.notes}"</p>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getStatusBadgeClass(selectedEvent.eventStatus)}`}>
                            {selectedEvent.eventStatus}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-200">
                        {/* Go to Chat - Always visible */}
                        <button
                            onClick={() => actionHandlers.onGoToChat(selectedEvent.partner.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            <FaComments />
                            <span>Go to Chat</span>
                        </button>

                        {/* Response buttons for receiver */}
                        {!selectedEvent.isCreator && selectedEvent.eventStatus === 'proposed' && new Date(selectedEvent.eventDate) >= new Date() && (
                            <>
                                <button
                                    onClick={() => {
                                        actionHandlers.onAccept(selectedEvent.id);
                                        setSelectedEvent(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <FaCheck />
                                    <span>Accept</span>
                                </button>
                                <button
                                    onClick={() => {
                                        actionHandlers.onDecline(selectedEvent.id);
                                        setSelectedEvent(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <FaTimes />
                                    <span>Decline</span>
                                </button>
                            </>
                        )}

                        {/* Edit button for creator */}
                        {selectedEvent.isCreator && selectedEvent.eventStatus === 'proposed' && new Date(selectedEvent.eventDate) >= new Date() && (
                            <button
                                onClick={() => {
                                    actionHandlers.onEdit(selectedEvent);
                                    setSelectedEvent(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <FaEdit />
                                <span>Edit</span>
                            </button>
                        )}

                        {/* Cancel button for creator */}
                        {selectedEvent.isCreator && selectedEvent.eventStatus === 'proposed' && new Date(selectedEvent.eventDate) >= new Date() && (
                            <button
                                onClick={() => {
                                    actionHandlers.onCancel(selectedEvent.id);
                                    setSelectedEvent(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <FaBan />
                                <span>Cancel</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
