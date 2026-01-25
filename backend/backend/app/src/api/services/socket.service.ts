import { Socket } from "socket.io";
import { getApplicationError } from "../helpers/getErrorObject.js";
import socketManager from "./socketManager.service.js";
import { IUserBrief, OutgoingMessagePayload, PresentedDm } from "../types/chat.type.js";
import ioEmitter from "./emitter.service.js";
import { INotification } from "../types/notification.type.js";


// Maybe extracting the whole payload
export function extractUserId(client: Socket) {
    return (client.handshake.auth.user.id);
}


type EventHandler = (client: Socket, data: any) => Promise<any>;

export function eventHandlerWithErrorHandler(fn: EventHandler) {
    return  async (client: Socket, data: any) => {
        console.log('dataaaaaaaaaaaa')
        try {
             await fn(client, data);
        } catch (e) {
            const { message } = getApplicationError(e);
            console.log(e);
            console.log(message)
            client.emit('error', {message: message});
        }
    }
}


export function isUserOnline(userId: number) {
    return socketManager.isUserOnline(userId);
}



// ! back to this
export function emitChatMessageEvent(
  senderId: number,
  receiverId: number,
  isSender: boolean,
  createdDm: PresentedDm,
  user: IUserBrief
) {
    const { firstName, lastName, profilePicture, status } = user;

    const base = {
        from: senderId,
        to: receiverId,
        isSender,
        firstName,
        lastName,
        profilePicture,
        status,
        messageId: createdDm.id,
        sentAt: createdDm.sentAt,
    };

    const outgoingMessage: OutgoingMessagePayload =
    createdDm.messageType === "text"
        ? { ...base, messageType: "text", messageContent: createdDm.messageContent }
        : createdDm.messageType === "audio"
        ? { ...base, messageType: "audio", messageContent: createdDm.messageContent }
        : { ...base, messageType: "event", messageContent: createdDm.messageContent };

    ioEmitter.emitToClientSockets(
        isSender ? senderId : receiverId,
        "chat:message",
        outgoingMessage
    );
}

export function emitNotificationEvent(notifierId: number, notification: INotification) {
    ioEmitter.emitToClientSockets(notifierId, 'notification:new', notification)
}
