import { Request, Response } from "express";
import { addFavoriteContactService, getChatHistory, getContactDetails, getContactsService, getParticipantInfoById, markMessagesAsReadService, removeFavoriteContactService, retrieveDms } from "../services/chat.service.js";
import { getHttpError } from '../helpers/getErrorObject.js';


export async function getUserContacts(request: Request, response: Response) {
    const   userId = request.user.id;
    console.log(`*******************`)
    // console.log(request.query);
    // const   page = Number(request.query.page) || 1;
    // const   pageSize = Number(request.query.pageSize) || 20;

    console.log(`get contacts of userID ${userId}`)

    try {
        const   contacts = await getContactsService(userId);
        // console.log(contacts);
        response.json(contacts);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}


export async function getDirectMessageList(request: Request, response: Response) {
    const   userId = request.user.id;
    console.log(`get dms of ${userId}`);

    try {
        const dms = await retrieveDms(userId);
        // response.cookie('blah', 'balh blah fgkdfjkgjd', {
        //     httpOnly: true,
        //     sameSite: 'strict',
        //     // secure: true
        // })
        console.log(dms)
        response.json(dms);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}


export async function getDmHistory(request: Request, response: Response) {
    const   userId = request.user.id;
    const   participantId: number = +request.params.userId;

    // console.log(request.query);
    const   page = Number(request.query.page) || 0;
    const   pageSize = Number(request.query.pageSize) || 20;

    // console.log(participantId);
    // assert(userId not blocking or blocked by participantId)

    try {
        // ? should i check for if the participant User id exsits????
        const chatHistory = await getChatHistory(userId, participantId, page, pageSize);
        response.json(chatHistory);
    } catch (e) {
        console.log(e);
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}

export async function getConversationDetails(request: Request, response: Response) {
    const participantId: number = +request.params.userId;

    try {
        const conversationDetails = await getContactDetails(participantId);
        response.json(conversationDetails);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}


// move this to the profile routes
export async function getParticipantInfo(request: Request, response: Response) {
    const participantId: number = +request.params.userId;

    try {
        const participantInfo = await getParticipantInfoById(request.user.id, participantId);
        response.json(participantInfo);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}


export async function MarkMessagesAsRead(request: Request, response: Response) {

    const   userId = request.user.id;
    const   participantId: number = +request.params.userId;
    
    try {
        await markMessagesAsReadService(userId, participantId)
        response.sendStatus(200);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
    
}

export async function addFavoriteContact(request: Request, response: Response) {
    const userId = request.user.id;
    const favUserId = request.body.userId;

    try {
        await addFavoriteContactService(userId, favUserId);
        response.sendStatus(201);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}

export async function removeFavoriteContact(request: Request, response: Response) {
    const userId = request.user.id;
    const favUserId = request.body.userId;

    try {
        await removeFavoriteContactService(userId, favUserId);
        response.sendStatus(200);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }


}


export async function getFavoritesChat(request: Request, response: Response) {
    try {
        // const favorites = await getFavoriteUsers(request.user.id);
        response.json({});
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}
