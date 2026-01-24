import { Request, Response } from 'express'
import { Filters } from '../types/explore.js';
import { getRecommendedProfilesService } from '../services/explore.js';

export async function getRecommendedProfiles(request: Request, response: Response) {
    const fameRatingRange = request.body.fameRatingRange;
    const ageRange = request.body.ageRange;
    const interests = request.body.interests;
    const maxDistanceKm = request.body.maxDistanceKm;
    const commonInterestsThreshold = request.body.commonInterestsThreshold;
    const userId = request.user.id;

    const filters: Filters = { fameRatingRange, ageRange, maxDistanceKm };

    if (interests?.length) {
        filters.interests = interests;
    }

    if (commonInterestsThreshold !== undefined) {
        filters.commonInterestsThreshold = commonInterestsThreshold;
    }

    try {
        const recommendedProfiles = await getRecommendedProfilesService(userId, filters);

        response.status(200).send( { recommendedProfiles } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}
