import { FC } from "react";
import { EventMessageContent } from "../../types";

type Props = {
    content: EventMessageContent;
    isSender: boolean;
    sentAt: string;
    onAccept?: (eventId: number) => void;
    onDecline?: (eventId: number) => void;
    onCancel?: (eventId: number) => void;
  };
  
  export const EventMessage: FC<Props> = ({
    content,
    isSender,
    sentAt,
    onAccept,
    onDecline,
    onCancel,
  }) => {
    const date = new Date(content.eventDate);
  
    return (
      <div
        className={`border rounded-xl p-4 max-w-[85%] md:max-w-[70%]
        ${isSender
          ? "bg-blue-50 border-blue-300"
          : "bg-green-50 border-green-300"}
        shadow-sm`}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-sm">📅 Event Proposal</p>
          <span className="text-xs text-gray-500">
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <p className="text-base font-medium">{content.title}</p>

        {content.notes && (
          <p className="mt-1 text-sm italic text-gray-600">
            {content.notes}
          </p>
        )}
  
        <div className="mt-3 flex items-center justify-between">
          {content.eventStatus === "proposed" ? (
            isSender ? (
              <button
                onClick={() => onCancel?.(content.id)}
                className="px-3 py-1 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700"
              >
                Cancel
              </button>
            ) : content.canRespond ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept?.(content.id)}
                  className="px-3 py-1 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => onDecline?.(content.id)}
                  className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Decline
                </button>
              </div>
            ) : (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                Awaiting response
              </span>
            )
          ) : (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full
              ${
                content.eventStatus === "accepted"
                  ? "bg-green-100 text-green-700"
                  : content.eventStatus === "declined"
                  ? "bg-red-100 text-red-700"
                  : content.eventStatus === "cancelled"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {content.eventStatus}
            </span>
          )}
  
          <span className="text-xs text-gray-400">{sentAt}</span>
        </div>
      </div>
    );
  };