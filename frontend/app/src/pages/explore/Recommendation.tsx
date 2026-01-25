import { useEffect, useState } from "react"
import { RecommendedProfileInfo, UserInfo } from "../../types/profile"
import { sendLoggedInActionRequest } from "../../utils/httpRequests"
import ErrorOccurred from "../../components/utils/error-occurred/ErrorOccurred"
import { isOfBackendRecommendedProfileType } from "../../utils/typeGuards"
import { SortOption } from "../../types/explore"
import ExploreBase from "./ExploreBase"
import { useCurrentUserInfo } from "../../context/UserProvider"
import { haversineDistanceKm } from "../../utils/generalPurpose"

const Recommendation = () => {
    // constants
    const DEFAULT_MIN_FAME = 0;
    const DEFAULT_MAX_FAME = 5;
    const DEFAULT_MIN_AGE = 18;
    const DEFAULT_MAX_AGE = 30;
    const DEFAULT_MAX_DISTANCE_KM = 500;
    const DEFAULT_COMMON_INTERESTS_THRESHOLD = 0;

    // state
    let [fameRatingRange, setFameRatingRange] = useState<number[]>([DEFAULT_MIN_FAME, DEFAULT_MAX_FAME]);
    let [ageRange, setAgeRange] = useState<number[]>([DEFAULT_MIN_AGE, DEFAULT_MAX_AGE]);
    let [maxDistanceKm, setMaxDistanceKm] = useState<number>(DEFAULT_MAX_DISTANCE_KM);
    let [interests, setInterests] = useState<Set<string>>();
    let [recommendedProfiles, setRecommendedProfiles] = useState<RecommendedProfileInfo[]>();
    let [errorOccurred, setErrorOccurred] = useState(false);
    let [sortBy, setSortBy] = useState<SortOption>(null);
    let [commonInterestsThreshold, setCommonInterestsThreshold] = useState<number>(DEFAULT_COMMON_INTERESTS_THRESHOLD);

    const userInfo = useCurrentUserInfo();

    // Sort helpers
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


    function distanceBucket(user: UserInfo, p: RecommendedProfileInfo): number {
        const d = haversineDistanceKm(
            user.latitude,
            user.longitude,
            p.latitude,
            p.longitude
        );
    
        if (d <= 10) {
            return 0;
        }
        if (d <= 50) {
            return 1;
        }
        if (d <= 200) {
            return 2;
        }
        return 3;
    }

    function recommendationSort(user: UserInfo, profiles: RecommendedProfileInfo[]): RecommendedProfileInfo[] {
        return profiles.sort((a, b) => {
            // 1️) distance has absolute priority
            const da = distanceBucket(user, a);
            const db = distanceBucket(user, b);
            if (da !== db) {
                return da - db;
            }

            // 2️) interests inside same distance bucket
            if (a.commonInterestsCount !== b.commonInterestsCount) {
                return b.commonInterestsCount - a.commonInterestsCount;
            }

            // 3️) fame as final tie-breaker
            return b.fameRating - a.fameRating;
        });
    }

    async function fetchProfiles() {
        setErrorOccurred(false);
        try {
            const requestBody: {[key: string]: any} = { 
                fameRatingRange, 
                ageRange, 
                maxDistanceKm, 
                commonInterestsThreshold
            };

            if (interests) {
                requestBody['interests'] = [...interests];
            }

            const responseBody = await sendLoggedInActionRequest(
                'POST', 
                import.meta.env.VITE_LOCAL_RECOMMENDED_PROFILES_API_URL, 
                requestBody
            );

            if (!responseBody?.recommendedProfiles
                || !Array.isArray(responseBody.recommendedProfiles)
                || !responseBody.recommendedProfiles.every((recommendedProfile: any) => isOfBackendRecommendedProfileType(recommendedProfile))) {
                setErrorOccurred(true);
                return;
            }

            if (responseBody.recommendedProfiles.length === 0) {
                setRecommendedProfiles([]);
                return;
            }

            responseBody.recommendedProfiles.forEach((item: any) => item.profileInterests = new Set(item.profileInterests));
            let profiles = responseBody.recommendedProfiles as RecommendedProfileInfo[];

            // sort: either user-selected or recommendation score
            if (sortBy && userInfo) {
                profiles = sortProfiles(profiles, sortBy, userInfo);
            } else if (userInfo) {
                recommendationSort(userInfo, profiles);
            }

            setRecommendedProfiles(profiles);
        }
        catch (err) {
            setErrorOccurred(true);
        }
    }

    useEffect(() => {
        fetchProfiles();
    }, [fameRatingRange, ageRange, interests, maxDistanceKm, sortBy]);

    if (errorOccurred) {
        return <ErrorOccurred />;
    }

    function updateFiltersAndSortBy(newFameRatingRange: number[], newAgeRange: number[], newInterests: Set<string>, newMaxDistanceKm: number, newSortBy: SortOption, isFormDirty: boolean) {
        if (!isFormDirty) {
            return;
        }
        setFameRatingRange(newFameRatingRange);
        setAgeRange(newAgeRange);
        setInterests(newInterests);
        setMaxDistanceKm(newMaxDistanceKm);
        setSortBy(newSortBy);
        setCommonInterestsThreshold(newInterests.size);
    }

    return (
        <ExploreBase 
            currFameRatingRange={fameRatingRange} 
            currAgeRange={ageRange} 
            currInterests={interests || new Set<string>()} 
            currMaxDistanceKm={maxDistanceKm} 
            currSortBy={sortBy} 
            recommendedProfiles={recommendedProfiles ?? []} 
            updateFiltersAndSortBy={updateFiltersAndSortBy} 
        />
    );
}

export default Recommendation;
