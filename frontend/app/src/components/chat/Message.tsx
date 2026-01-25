import { FC } from "react";
import { MessageType } from "../../types";
import { EventMessage } from "./EventMessage";

const Message: FC<{ message: MessageType }> = ({ message }) => {
    const { isSender, sentAt } = message;

    return (
        <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
            {message.messageType === "audio" && (
                <audio controls src={message.content} />
            )}

            {message.messageType === "text" && (
                <div
                    className={`h-min border p-2 max-w-[85%] md:max-w-[70%] rounded-t-lg text-sm md:text-base
                    ${isSender
                        ? "rounded-bl-lg bg-light-gray1"
                        : "rounded-br-lg bg-red-light"}
                    break-words`}
                >
                    {message.content}
                    <p
                        className={`text-gray-500 text-xs flex ${
                            isSender ? "justify-start" : "justify-end"
                        }`}
                    >
                        {sentAt}
                    </p>
                </div>
            )}

            {message.messageType === 'event'
                && <EventMessage
                        content={message.content}
                        isSender={isSender}
                        sentAt={sentAt}
                    />
            }
        </div>
    );
};

export default Message;
