import { Request, Response } from "express";
import { getChatHistory, getContactDetails, getContactsService, getFavoriteUsers, getParticipantInfoById, retrieveDms } from "../services/chat.service.js";
import { getHttpError } from '../helpers/getErrorObject.js';


export async function getUserContacts(request: Request, response: Response) {
    const   userId = request.user.id;

    console.log(`get contacts of userID ${userId}`)

    try {
        const   contacts = await getContactsService(userId);
        console.log(contacts);
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
        response.json(dms);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}


export async function getDmHistory(request: Request, response: Response) {
    const   userId = request.user.id;
    const   participantId: number = +request.params.id;

    // console.log(participantId);
    // assert(userId not blocking or blocked by participantId)

    try {
        // ? should i check for if the participant User id exsits????
        const chatHistory = await getChatHistory(userId, participantId);
        response.json(chatHistory);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}

export async function getConversationDetails(request: Request, response: Response) {
    const participantId: number = +request.params.id;

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
    const participantId: number = +request.params.id;

    try {
        const participantInfo = await getParticipantInfoById(participantId);
        response.json(participantInfo);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}


export async function getFavoritesChat(request: Request, response: Response) {
    try {
        const favorites = await getFavoriteUsers(request.user.id);
        response.json(favorites);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }
}
