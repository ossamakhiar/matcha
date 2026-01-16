import { useEffect, useState } from "react"
import { RecommendedProfileInfos } from "../../types/profile"
import { sendLoggedInActionRequest } from "../../utils/httpRequests"
import { isOfBackendRecommendedProfileType } from "../../utils/typeGuards"
import ExploreBase from "./ExploreBase"
import ErrorOccurred from "../../components/utils/error-occurred/ErrorOccurred"

const Recommendation = () => {
    let [recommendedProfiles, setRecommendedProfiles] = useState<RecommendedProfileInfos[]>();
    let [isLoading, setIsLoading] = useState(true);
    let [errorOccurred, setErrorOccurred] = useState(false);

    async function fetchProfiles() {
        setIsLoading(true);
        setErrorOccurred(false);
        try {
            const requestBody: {[key: string]: any} = { fameRatingRange: [0, 5], ageRange: [18, 30], maxDistanceKm: 500, commonInterestsTreshold: 1 };

            console.log('Recommendation AgeFilter: ' + requestBody.ageRange);
            console.log('Recommendation FameRatingFilter: ' + requestBody.fameRatingRange);
            console.log('Recommendation maxDistanceKm: ' + requestBody.maxDistanceKm);
            console.log('Recommendation commonInterestsTreshold: ' + requestBody.commonInterestsTreshold);

            const responseBody = await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_RECOMMENDED_PROFILES_API_URL, requestBody);

            console.log('Recommendation recommendedProfiles: ', responseBody.recommendedProfiles);

            if (!responseBody || !responseBody.recommendedProfiles
                || !Array.isArray(responseBody.recommendedProfiles)
                || !responseBody.recommendedProfiles.every( (recommendedProfile: any) => isOfBackendRecommendedProfileType(recommendedProfile))) {
                setErrorOccurred(true);
                return ;
            }
 
            if (responseBody.recommendedProfiles.length == 0) {
                setRecommendedProfiles([]);
                return ;
            }

            responseBody.recommendedProfiles.forEach((item: any) => item.profileInterests = new Set(item.profileInterests));
            // sort logic
            setRecommendedProfiles(responseBody.recommendedProfiles);
        }
        catch (err) {
            setErrorOccurred(true);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchProfiles();
    }, []);

    if (isLoading) {
        return null;
    }

    if (errorOccurred) {
        return <ErrorOccurred />;
    }

    return (
        <ExploreBase recommendedProfiles={recommendedProfiles ?? []} isAdvancedSearch={false} fetchProfiles={fetchProfiles} />
    )
}

export default Recommendation;