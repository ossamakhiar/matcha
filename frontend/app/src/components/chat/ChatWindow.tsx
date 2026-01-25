import ChatBox from "./ChatBox";
import ConversationHeader from "./ConversationHeader";
import { EventsEnum, IncomingMessagePayload, MessageType, ParticipantUser } from "../../types";
import { Dispatch, SetStateAction } from "react";
import eventObserver from "../../utils/eventObserver";
import { useActiveDm } from "../../context/activeDmProvider";
import { prepareSocketEventRegistration } from "../../utils/socket";
import { useSocketEventRegister } from "../../hooks/useSocketEventResgiter";
import MessagesProvider from "../../context/messagesProvider";
import useFetch from "../../hooks/useFetch";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { sendLoggedInActionRequest } from "../../utils/httpRequests";
import { useSocket } from "../../context/SocketProvider";

// function   

function mapIncomingToMessage(
    message: IncomingMessagePayload & { messageId: number }
): MessageType {
    if (message.messageType === "text") {
        return {
            messageId: message.messageId,
            isSender: message.isSender,
            sentAt: message.sentAt,
            messageType: "text",
            content: message.messageContent, // string
        };
    }

    if (message.messageType === "audio") {
        return {
            messageId: message.messageId,
            isSender: message.isSender,
            sentAt: message.sentAt,
            messageType: "audio",
            content: message.messageContent, // string (URL)
        };
    }

    // must be event
    return {
        messageId: message.messageId,
        isSender: message.isSender,
        sentAt: message.sentAt,
        messageType: "event",
        content: message.messageContent, // EventMessageContent
    };
}

function registerEventHandlers(
    setMessages: Dispatch<SetStateAction<MessageType[] | undefined>>,
    setParticipant: Dispatch<SetStateAction<ParticipantUser | undefined>>
) {
    const { activeDmId } = useActiveDm();

    const messageReceivedHandler = (
        message: IncomingMessagePayload & { messageId: number }
    ) => {
        if (message.from === activeDmId || message.isSender) {
            setMessages((prev) => {
                if (!prev) return prev;

                return [
                    mapIncomingToMessage(message),
                    ...prev,
                ];
            });

            // TODO: emit message-read event
        }
    };

    const selectedConversationPresenceHandler = (onlineUsers: number[]) => {
        const status = onlineUsers.includes(activeDmId)
            ? "online"
            : "offline";

        setParticipant((prev) => {
            if (!prev || prev.status === status) return prev;
            return { ...prev, status };
        });
    };

    const eventStatusUpdateHandler = (data: { eventId: number; status: string; messageId: number }) => {
        setMessages((prev) => {
            if (!prev) return prev;

            return prev.map((msg) => {
                if (msg.messageType === "event" && msg.content.id === data.eventId) {
                    return {
                        ...msg,
                        content: {
                            ...msg.content,
                            eventStatus: data.status as any,
                            canRespond: false,
                        },
                    };
                }
                return msg;
            });
        });
    };

    const registrarFunction = prepareSocketEventRegistration([
        [EventsEnum.CHAT_RECEIVE, messageReceivedHandler],
        [EventsEnum.GLOBAL_PRESENCE, selectedConversationPresenceHandler],
        [EventsEnum.EVENT_STATUS_UPDATE, eventStatusUpdateHandler],
    ]);

    useSocketEventRegister(registrarFunction, [activeDmId]);
}



const ChatWindow = () => {
    const   socket = useSocket();
    const   {activeDmId} = useActiveDm();
    const   messages = usePaginatedFetch<MessageType>(`${import.meta.env.VITE_LOCAL_CHAT_DMS}/${activeDmId}`);
    const   [participant, setParticipant] = useFetch<ParticipantUser>(`${import.meta.env.VITE_LOCAL_CHAT_DM_PARTICIPANT}/${activeDmId}`);

    registerEventHandlers(messages.setData, setParticipant);
    
    const   handleFavoriteClick = async (conversationId: number) => {
        setParticipant((prev) => {
            if (!prev)
                return ;
            return ({...prev, isFavorite: !prev.isFavorite})
        });
        if (!participant)
            return ;
        // ! Post it
        try {
            await sendLoggedInActionRequest(!participant.isFavorite ? 'POST' : 'DELETE', import.meta.env.VITE_LOCAL_CHAT_FAVORITES, {userId: activeDmId});
            eventObserver.publish(EventsEnum.APP_FAVORITE_CHANGE, conversationId);
        } catch (e) {
            console.log(e);
            // ! later handling
        }
    }

    const handleEventAccept = (eventId: number) => {
        socket?.emit(EventsEnum.EVENT_RESPOND, { eventId, action: 'accept' });
    };

    const handleEventDecline = (eventId: number) => {
        socket?.emit(EventsEnum.EVENT_RESPOND, { eventId, action: 'decline' });
    };

    const handleEventCancel = (eventId: number) => {
        socket?.emit(EventsEnum.EVENT_RESPOND, { eventId, action: 'cancel' });
    };

    const   reversed_data = [...(messages.data || [])].reverse();

    return (
        <MessagesProvider
            value={
                {
                    messages: reversed_data,
                    setMessages: messages.setData,
                    fetchMoreMessages: messages.fetchMoreData,
                    hasMore: messages.hasMore,
                    onEventAccept: handleEventAccept,
                    onEventDecline: handleEventDecline,
                    onEventCancel: handleEventCancel,
                }
            }
        >
            <div className="w-full h-full flex flex-col">
                {/* normally the passed user will be the participant in user in the conversation */}
                {participant && 
                    <ConversationHeader {...participant} onClick={handleFavoriteClick} /> }
                <ChatBox key={activeDmId}/>
            </div>
        </MessagesProvider>
    )
}




export default ChatWindow;
