import { useEffect, useState } from "react"
import { RecommendedProfileInfo, UserInfo } from "../../types/profile"
import { sendLoggedInActionRequest } from "../../utils/httpRequests"
import ErrorOccurred from "../../components/utils/error-occurred/ErrorOccurred"
import { isOfBackendRecommendedProfileType } from "../../utils/typeGuards"
import { SortOption } from "../../types/explore"
import ExploreBase from "./ExploreBase"
import { useCurrentUserInfo } from "../../context/UserProvider"
import { haversineDistanceKm } from "../../utils/generalPurpose"

const AdvancedSearch = () => {
    let [fameRatingRange, setFameRatingRange] = useState<number[] | null>(null);
    let [ageRange, setAgeRange] = useState<number[] | null>(null);
    let [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);
    let [interests, setInterests] = useState<Set<string> | null>(null);
    let [recommendedProfiles, setRecommendedProfiles] = useState<RecommendedProfileInfo[]>();
    let [errorOccurred, setErrorOccurred] = useState(false);
    let [sortBy, setSortBy] = useState<SortOption>(null);

    const userInfo = useCurrentUserInfo();

    function sortProfiles(
        profiles: RecommendedProfileInfo[],
        sortBy: SortOption,
        userInfo: UserInfo
    ): RecommendedProfileInfo[] {
        const sorted = [...profiles];
    
        switch (sortBy) {
            case "fame":
                return sorted.sort(
                    (a, b) => b.fameRating - a.fameRating
                );
    
            case "age":
                return sorted.sort(
                    (a, b) =>
                        Math.abs(a.age - userInfo.age) -
                        Math.abs(b.age - userInfo.age)
                );
    
            case "distance":
                return sorted.sort((a, b) => {
                    const distA = haversineDistanceKm(
                        userInfo.latitude,
                        userInfo.longitude,
                        a.latitude,
                        a.longitude
                    );
                    const distB = haversineDistanceKm(
                        userInfo.latitude,
                        userInfo.longitude,
                        b.latitude,
                        b.longitude
                    );
                    return distA - distB;
                });
    
            case "interests":
                return sorted.sort(
                    (a, b) => b.commonInterestsCount - a.commonInterestsCount
                );
    
            default:
                return sorted;
        }
    }


    async function fetchProfiles() {
        setErrorOccurred(false);
        try {
            const requestBody: {[key: string]: any} = { fameRatingRange, ageRange, maxDistanceKm };

            if (interests) {
                requestBody['interests'] = [...interests];
            }

            const responseBody = await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_RECOMMENDED_PROFILES_API_URL, requestBody);

            if (!responseBody?.recommendedProfiles
                || !Array.isArray(responseBody.recommendedProfiles)
                || !responseBody.recommendedProfiles.every( (recommendedProfile: any) => isOfBackendRecommendedProfileType(recommendedProfile))) {
                setErrorOccurred(true);
                return ;
            }
 
            if (responseBody.recommendedProfiles.length === 0) {
                setRecommendedProfiles([]);
                return ;
            }

            responseBody.recommendedProfiles.forEach((item: any) => item.profileInterests = new Set(item.profileInterests));
            let profiles = responseBody.recommendedProfiles;

            // sort if possible/needed
            if (sortBy && userInfo) {
                profiles = sortProfiles(profiles, sortBy, userInfo);
            }

            setRecommendedProfiles(profiles);
        }
        catch (err) {
            setErrorOccurred(true);
        }
    }

    useEffect(() => {
        if (fameRatingRange !== null &&
            ageRange !== null &&
            maxDistanceKm !== null
        ) {
            fetchProfiles();
        }
    }, [fameRatingRange, ageRange, interests, maxDistanceKm, sortBy]);

    if (errorOccurred) {
        return <ErrorOccurred />;
    }

    function updateFiltersAndSortBy(newFameRatingRange: number[], newAgeRange: number[], newInterests: Set<string>, newMaxDistanceKm: number, newSortBy: SortOption, isFormDirty: boolean) {
        if (!isFormDirty) {
            return ;
        }
        setFameRatingRange(newFameRatingRange);
        setAgeRange(newAgeRange);
        setInterests(newInterests);
        setMaxDistanceKm(newMaxDistanceKm);
        setSortBy(newSortBy);
    }

    return (
        <ExploreBase currFameRatingRange={fameRatingRange} currAgeRange={ageRange} currInterests={interests || new Set<string>()} currMaxDistanceKm={maxDistanceKm} currSortBy={sortBy} recommendedProfiles={recommendedProfiles ?? []} updateFiltersAndSortBy={updateFiltersAndSortBy} />
    )
}

export default AdvancedSearch;