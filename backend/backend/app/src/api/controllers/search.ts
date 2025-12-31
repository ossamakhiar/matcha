import { Request, Response } from 'express'
import { getHttpError } from '../helpers/getErrorObject.js'
import { getSearchResultService } from '../services/search.service.js';

export async function getSearchResult(request: Request, response: Response) {
    const userId = request.user.id;
    const searchQuery = request.query.s || '';
    const page = Number(request.query.page) || 0;
    const pageSize = Number(request.query.pageSize) || 20;

    if (typeof searchQuery != 'string') {
        response.json([]);
        return ;
    }

    try {
        const   results = await getSearchResultService(userId, searchQuery, page, pageSize);
        response.json(results);
    } catch (e) {
        const {status, message} = getHttpError(e);
        response.status(status).json({status, message});
    }

} 