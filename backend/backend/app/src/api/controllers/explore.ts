import { Request, Response } from 'express'
import { Filters } from '../types/explore.js';
import { getRecommendedProfilesService } from '../services/explore.js';

export async function getRecommendedProfiles(request: Request, response: Response) {
    const fameRatingRange = request.body.fameRatingRange;
    const ageRange = request.body.ageRange;
    const interests = request.body.interests;
    const maxDistanceKm = request.body.maxDistanceKm;
    const commonInterestsTreshold = request.body.commonInterestsTreshold;
    const userId = request.user.id;

    const filters: Filters = { fameRatingRange, ageRange, maxDistanceKm };

    if (interests?.length) {
        filters.interests = interests;
    }

    if (commonInterestsTreshold) {
        filters.commonInterestsTreshold = commonInterestsTreshold;
    }

    try {
        const recommendedProfiles = await getRecommendedProfilesService(userId, filters);

        if (recommendedProfiles.length === 0) {
            // console.log('no recommendedProfile');
        }

        // console.log('recommendedProfiles: ' + recommendedProfiles);

        response.status(200).send( { recommendedProfiles } );
    }
    catch (err) {
        response.sendStatus(500);
    }
}
