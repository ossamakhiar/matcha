import { Socket } from "socket.io";
import { emitChatMessageEvent, emitNotificationEvent, eventHandlerWithErrorHandler, extractUserId } from "../services/socket.service.js";
import { IDirectMessage, IncomingMessagePayload } from "../types/chat.type.js";
import ioEmitter from '../services/emitter.service.js';
import { ApplicationError } from "../helpers/ApplicationError.js";
import { areMatched, createNewDm, MarkMessageAsRead, messageExists } from "../services/chat.service.js";
import { NotificationTypesEnum } from "../types/enums.js";
import { createNewNotification } from "../services/notification.service.js";
import { generateAudioFileName, getUserBrief, saveAudioFile } from "../services/helper.service.js";


async   function messagePersistencyHandler(senderId: number, receiverId: number, messageType: string, messageContent: string | ArrayBuffer) {
    let audioFileName: string = '';

    if (messageType === 'audio') {
        // Asynchronously saving the file but synchronously validating the file mime
        audioFileName = await saveAudioFile(messageContent as ArrayBuffer, generateAudioFileName(senderId));
    }

    // if type is audio then content will be the audio file
    const createdDm: IDirectMessage = await createNewDm(senderId, receiverId, messageType, messageType === 'text' ? messageContent : audioFileName)
    return ({
        ...createdDm,
        messageContent: (createdDm.messageType === 'text') ? createdDm.messageContent : process.env.BASE_URL + '/' + audioFileName
    })
}


async function sendMessageHandler(client: Socket, message: IncomingMessagePayload) {
    const   senderId = extractUserId(client);
    const   receiverId = message.to;

    // !! validate the emitted object
    // checking the message type should be either 'text' ot 'audio'
    // console.log(`senderId: ${senderId}`)
    // console.log(`receiverId: ${receiverId}`)
    // console.log('dataaaaaaaaaaaaaaa')
    if (senderId === receiverId)
        return ;

    let receiverBreif = await getUserBrief(receiverId);
    // checking if they are matched
    if (!await areMatched(senderId, receiverId))
        throw new ApplicationError('you\'re not matched');

    // console.log(receiverBreif);
    const senderBrief = await getUserBrief(senderId);

    const   createdDm = await messagePersistencyHandler(senderId, receiverId, message.messageType, message.messageContent)
    // const messageId = await createNewDm(senderId, receiverId, message.messageContent);

    emitChatMessageEvent(senderId, receiverId, true, createdDm, receiverBreif);
    emitChatMessageEvent(senderId, receiverId, false, createdDm, senderBrief);


    const notification = await createNewNotification(receiverId, senderBrief!, NotificationTypesEnum.NEW_MESSAGE);
    // console.log(notification);
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