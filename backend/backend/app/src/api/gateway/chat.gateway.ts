import { Socket } from "socket.io";
import { emitChatMessageEvent, emitNotificationEvent, eventHandlerWithErrorHandler, extractUserId } from "../services/socket.service.js";
import { IncomingMessagePayload, PresentedDm } from "../types/chat.type.js";
import ioEmitter from '../services/emitter.service.js';
import { ApplicationError } from "../helpers/ApplicationError.js";
import { areMatched, createNewDm, MarkMessageAsRead, messageExists } from "../services/chat.service.js";
import { NotificationTypesEnum } from "../types/enums.js";
import { createNewNotification } from "../services/notification.service.js";
import { generateAudioFileName, getUserBrief, saveAudioFile } from "../services/helper.service.js";
import { createEvent } from "../services/event.service.js";
import assert from "assert";

async function persistMessage(
  senderId: number,
  receiverId: number,
  msg: IncomingMessagePayload
): Promise<PresentedDm> {
  switch (msg.messageType) {
    case "text": {
        const row = await createNewDm({
            senderId,
            receiverId,
            messageType: "text",
            content: msg.messageContent,
        });

        assert(row.messageType === "text")
        return {
            id: row.id,
            messageType: "text",
            messageContent: row.content,
            sentAt: row.sentAt,
        };
    }

    case "audio": {
        msg
      const audioFileName = await saveAudioFile(
        msg.messageContent,
        generateAudioFileName(senderId)
      );

      const row = await createNewDm({
        senderId,
        receiverId,
        messageType: "audio",
        content: audioFileName,
      });

      return {
        id: row.id,
        messageType: "audio",
        messageContent: `${process.env.BASE_URL}/${audioFileName}`, // client gets URL
        sentAt: row.sentAt,
      };
    }

    case "event": {
      const event = await createEvent({
        ...msg.messageContent,
        creatorId: senderId,
      });

      const row = await createNewDm({
        senderId,
        receiverId,
        messageType: "event",
        eventId: event.id,
      });

      return {
        id: row.id,
        messageType: "event",
        messageContent: {...event, canRespond: true},
        sentAt: row.sentAt,
      };
    }

    default: {
      const _exhaustive: never = msg;
      return _exhaustive;
    }
  }
}
async function sendMessageHandler(client: Socket, message: IncomingMessagePayload) {
    const   senderId = extractUserId(client);
    const   receiverId = message.to;

    // !! validate the emitted object
    // checking the message type should be either 'text' ot 'audio'
    if (senderId === receiverId)
        return ;

    let receiverBreif = await getUserBrief(receiverId);
    // checking if they are matched
    if (!await areMatched(senderId, receiverId))
        throw new ApplicationError('you\'re not matched');

    const senderBrief = await getUserBrief(senderId);

    const   createdDm = await persistMessage(senderId, receiverId, message)

    emitChatMessageEvent(senderId, receiverId, true, createdDm, receiverBreif);
    emitChatMessageEvent(senderId, receiverId, false, createdDm, senderBrief);


    const notification = await createNewNotification(receiverId, senderBrief!, NotificationTypesEnum.NEW_MESSAGE);
    emitNotificationEvent(receiverId, notification);

}

async function handleMarkMessageAsRead(client: Socket, data: {participantId: number, messageId: number}) {
    const   { participantId, messageId } = data;
    const   userId = extractUserId(client);

    if (!participantId || typeof participantId !== 'number'
            || !messageId || typeof messageId !== "number") {
        throw new ApplicationError('Invalid socket data for read event')
    }

    if (participantId === userId)
        return ; // ? do nothing
    if (!await areMatched(userId, participantId))
        throw new ApplicationError('you\'re not matched');

    if (!await messageExists(participantId, userId, messageId))
        throw new ApplicationError('message does not exists');

    // commit to the database the changes. (status of the messageId)
    await MarkMessageAsRead(messageId);
}





function registerChatHandlers(client: Socket) {
    client.on('chat:send', (data) => eventHandlerWithErrorHandler(sendMessageHandler)(client, data));
    client.on('chat:markAsRead', (data) => eventHandlerWithErrorHandler(handleMarkMessageAsRead)(client, data));


    // ! testing => remove later
    client.on('chat:error', () => {
        const senderId = extractUserId(client);
    
        ioEmitter.emitToClientSockets(senderId, 'error', {
            error: "blahblahbl jsgdk"
        })
    });
}


export default registerChatHandlers;