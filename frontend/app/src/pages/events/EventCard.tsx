import { FC } from "react";
import { ScheduledEvent, EventActionHandlers } from "./types";
import { formatEventDate, getStatusBadgeClass } from "./utils";
import { FaComments, FaCheck, FaTimes, FaBan, FaEdit } from "react-icons/fa";

type Props = {
    event: ScheduledEvent;
    actionHandlers: EventActionHandlers;
};

export const EventCard: FC<Props> = ({ event, actionHandlers }) => {
    const { date, time, dayOfWeek } = formatEventDate(event.eventDate);
    const isPast = new Date(event.eventDate) < new Date();
    const canRespond = !event.isCreator && event.eventStatus === 'proposed' && !isPast;
    const canCancel = event.isCreator && event.eventStatus === 'proposed' && !isPast;
    const canEdit = event.isCreator && event.eventStatus === 'proposed' && !isPast;

    return (
        <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                isPast ? "opacity-70" : ""
            }`}
        >
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 text-center">
                            <div className="bg-pink rounded-lg p-3 text-white">
                                <div className="text-2xl font-bold">
                                    {new Date(event.eventDate).getDate()}
                                </div>
                                <div className="text-xs uppercase">
                                    {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {event.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                <span>{dayOfWeek}</span>
                                <span>•</span>
                                <span>{time}</span>
                            </div>
                            <div className="flex items-center space-x-3 mb-2">
                                <img
                                    src={event.partner.profilePicture}
                                    alt={`${event.partner.firstName} ${event.partner.lastName}`}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="text-sm">
                                    <span className="text-gray-600">
                                        {event.isCreator ? "with" : "from"}
                                    </span>
                                    <span className="font-medium text-gray-900 ml-1">
                                        {event.partner.firstName} {event.partner.lastName}
                                    </span>
                                </div>
                            </div>
                            {event.notes && (
                                <p className="text-sm text-gray-600 italic mt-2">
                                    {event.notes}
                                </p>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                                {date}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                event.eventStatus
                            )}`}
                        >
                            {event.eventStatus}
                        </span>
                        {event.isCreator && (
                            <span className="text-xs text-gray-500">You proposed</span>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex gap-2 flex-wrap">
                    <button
                        onClick={() => actionHandlers.onGoToChat(event.partner.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        <FaComments />
                        <span>Go to Chat</span>
                    </button>

                    {/* Response buttons for receiver */}
                    {canRespond && (
                        <>
                            <button
                                onClick={() => actionHandlers.onAccept(event.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <FaCheck />
                                <span>Accept</span>
                            </button>
                            <button
                                onClick={() => actionHandlers.onDecline(event.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <FaTimes />
                                <span>Decline</span>
                            </button>
                        </>
                    )}

                    {/* Edit button for creator */}
                    {canEdit && (
                        <button
                            onClick={() => actionHandlers.onEdit(event)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <FaEdit />
                            <span>Edit</span>
                        </button>
                    )}

                    {/* Cancel button for creator */}
                    {canCancel && (
                        <button
                            onClick={() => actionHandlers.onCancel(event.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <FaBan />
                            <span>Cancel</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
