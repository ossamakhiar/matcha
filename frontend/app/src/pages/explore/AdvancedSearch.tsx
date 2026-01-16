import { useEffect, useState } from "react"
import { RecommendedProfileInfos } from "../../types/profile"
import { sendLoggedInActionRequest } from "../../utils/httpRequests"
import ErrorOccurred from "../../components/utils/error-occurred/ErrorOccurred"
import { isOfBackendRecommendedProfileType } from "../../utils/typeGuards"
import { SortOption } from "../../types/explore"
import ExploreBase from "./ExploreBase"

const AdvancedSearch = () => {
    let [fameRatingRange, setFameRatingRange] = useState([0, 5]);
    let [ageRange, setAgeRange] = useState([18, 30]);
    let [maxDistanceKm, setMaxDistanceKm] = useState(500);
    let [interests, setInterests] = useState<Set<string>>();
    let [recommendedProfiles, setRecommendedProfiles] = useState<RecommendedProfileInfos[]>();
    let [isLoading, setIsLoading] = useState(true);
    let [errorOccurred, setErrorOccurred] = useState(false);
    let [sortBy, setSortBy] = useState<SortOption>(null);

    async function fetchProfiles() {
        setIsLoading(true);
        setErrorOccurred(false);
        try {
            const requestBody: {[key: string]: any} = { fameRatingRange, ageRange, maxDistanceKm };

            if (interests) {
                requestBody['interests'] = [...interests];
            }

            console.log('AdvancedSearch AgeFilter: ' + requestBody.ageRange);
            console.log('AdvancedSearch FameRatingFilter: ' + requestBody.fameRatingRange);
            console.log('AdvancedSearch maxDistanceKm: ' + requestBody.maxDistanceKm);
            console.log('AdvancedSearch commonInterestsTreshold: ' + requestBody.commonInterestsTreshold);
            console.log('AdvancedSearch sortBy: ' + sortBy);

            const responseBody = await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_RECOMMENDED_PROFILES_API_URL, requestBody);

            console.log('AdvancedSearch recommendedProfiles: ', responseBody.recommendedProfiles);

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
    }, [fameRatingRange, ageRange, interests]);

    if (isLoading) {
        return (null);
    }

    if (errorOccurred) {
        return <ErrorOccurred />;
    }

    function updateFiltersAndSortBy(newFameRatingRange: number[], newAgeRange: number[], newInterests: Set<string>, newMaxDistanceKm: number, newSortBy: SortOption) {
        setFameRatingRange(newFameRatingRange);
        setAgeRange(newAgeRange);
        setInterests(newInterests);
        setMaxDistanceKm(newMaxDistanceKm);
        setSortBy(newSortBy);
    }

    return (
        <ExploreBase recommendedProfiles={recommendedProfiles ?? []} isAdvancedSearch={true} fetchProfiles={fetchProfiles} updateFiltersAndSortBy={updateFiltersAndSortBy} />
    )
}

export default AdvancedSearch;