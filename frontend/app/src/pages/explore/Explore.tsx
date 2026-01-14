import { FaArrowRight, FaHeart } from "react-icons/fa"
import { GrMapLocation } from "react-icons/gr"
import { ImFilter } from "react-icons/im"
import { TbGenderAndrogyne, TbGenderFemme, TbGenderMale } from "react-icons/tb"
import interests from "../../utils/interests"
import FameRatingDisplay from "../../components/utils/FameRatingDisplay"
import { BioAndInterestsProps, MatchedUserSummaryProps } from "./types"
import { useEffect, useState } from "react"
import FilterOverlay from "../../components/explore/FilterOverlay"
import { RecommendedProfileInfos } from "../../types/profile"
import { sendLoggedInActionRequest } from "../../utils/httpRequests"
import NoResult from "../../components/utils/no-results/NoResults"
import ErrorOccurred from "../../components/utils/error-occurred/ErrorOccurred"
import { isOfBackendRecommendedProfileType } from "../../utils/typeGuards"
import { FaArrowLeft, FaMap } from "react-icons/fa6"
import { Link, useNavigate } from "react-router-dom"
import { InteractiveMap } from "./InterectiveMap"

const   MatchedUserSummary = ({firstName, lastName, fameRating, age, gender}: MatchedUserSummaryProps) => {
    return (
        <div className="flex flex-col sm:gap-1">
            <h1 className="text-2xl lg:text-3xl text-white font-semibold whitespace-nowrap">{firstName} {lastName}</h1>
            <div className="w-28 sm:w-36">
                <FameRatingDisplay starsCount={fameRating} size={30}/>
            </div>
            <div className="flex items-center gap-1 mb-3">
                <GrMapLocation className="stroke-sky-300" size={20}/>
                {/* <h2 className="text-lg lg:text-xl text-sky-300 font-semibold whitespace-nowrap">6 Km, Morroco</h2> */}
                <span className="px-2 bg-sky-950 flex items-center gap-1 w-max text-white font-semibold rounded-full">
                    {gender == 'male' ? <TbGenderMale size={20} />
                    : gender == 'female' ? <TbGenderFemme size={20}/>
                    : <TbGenderAndrogyne />}
                   {age}
                </span>
            </div>
        </div>
    )
}

function BioAndInterests({biography, userInterests}: BioAndInterestsProps) {

    return (
        <div className="flex-col md:pr-4 shadow md:overflow-y-auto md:scrollbar rounded-20px md:aspect-[2/3]">
            <div className="pb-6 pr-3 pl-3">
                <h2 style={{fontSize: 30, fontWeight: 'semi-bold'}} className="risque-regular pl-2 sm:pt-6 pl-10 pb-6">Biography</h2>
                <p style={{fontSize: 20}} className="text-center">{biography}</p>
            </div>
            <div className="">
                <h2 style={{fontSize: 30, fontWeight: 'semi-bold'}} className="risque-regular pt-6 pl-2 sm:pl-10 pb-6">Interests</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 pl-2 lg:pl-7 pr-1 grid-cols-3 grid-rows-7 gap-y-5 gap-x-2 pb-5">
                    {
                        interests.map(
                            (interest, index) => (
                                <div key={`Interest-${index + 1}`} className={`flex justify-center tag cursor-pointer max-w-32 fit-box ${userInterests.has(interest) ? 'bg-button-pink' : ''}`}>
                                    <h3>#{interest}</h3>
                                </div>
                            )
                        )
                    }
                </div>
            </div>
        </div>
    )
}

const   MatchedProfile = ({ profileInfos }: { profileInfos: RecommendedProfileInfos }) => {

    return (
        <div className="flex flex-row gap-10 w-full h-full max-h-full md:max-h-screen w-full pb-20 md:w-11/12 lg:w-9/12 2xl:w-8/12">
            <div className="md:w-1/2 md:overflow-y-auto md:scrollbar overflow-x-hidden">
                <div className="relative aspect-[2/3] mb-10 pr-1 md:pr-4 pt-1 md:pt-3">
                    <Link to={`/profile/${profileInfos.id}`}><img src={profileInfos.profilePicture} className="w-full h-full object-cover rounded-2xl shadow-lg shadow-blue-500" /></Link>
                    <div className="absolute bottom-4 left-7 w-[50%]">
                        <MatchedUserSummary id={profileInfos.id} firstName={profileInfos.firstName} lastName={profileInfos.lastName} age={profileInfos.age} fameRating={profileInfos.fameRating} gender={profileInfos.gender}/>
                    </div>
                </div>
                <div className="md:hidden md:w-1/2 overflow-x-hidden overflow-y-hidden md:overflow-y-auto md:scrollbar mb-10">
                    <BioAndInterests biography={profileInfos.biography} userInterests={profileInfos.profileInterests}/>
                </div>
                <h2 style={{fontSize: 30, fontWeight: 'semi-bold'}} className="risque-regular pt-6 pl-2 sm:pl-6 pb-6">Photos</h2>
                {
                    profileInfos && profileInfos.profilePhotos && profileInfos.profilePhotos.length > 0 ?
                    profileInfos.profilePhotos.map((pictureURL) => (
                        <div className="relative aspect-[2/3] overflow-y-auto scrollbar overflow-x-hidden mb-6 pr-4">
                            <img src={pictureURL} className="w-full h-full object-cover rounded-2xl shadow-lg shadow-blue-500" />
                        </div>
                    )) : null
                }
            </div>

            <div className="md:w-1/2 md:overflow-y-auto md:scrollbar overflow-x-hidden hidden md:inline-flex">
                <BioAndInterests biography={profileInfos.biography} userInterests={profileInfos.profileInterests}/>
            </div>
        </div>
    )
}

const Explore = () => {
    let [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);
    let [isMapOpen, setIsMapOpen] = useState(false);
    let [fameRatingRange, setFameRatingRange] = useState([0, 5]);
    let [ageRange, setAgeRange] = useState([18, 30]);
    let [interests, setInterests] = useState<Set<string>>();
    let [currIndex, setCurrIndex] = useState(0);
    let [recommendedProfiles, setRecommendedProfiles] = useState<RecommendedProfileInfos[]>();
    let [isLoading, setIsLoading] = useState(true);
    let [errorOccurred, setErrorOccurred] = useState(false);
    let [noResult, setNoResult] = useState(false);
    let navigate = useNavigate();

    async function fetchProfiles() {
        setIsLoading(true);
        setErrorOccurred(false);
        setNoResult(false);
        try {
            const requestBody: {[key: string]: any} = { fameRatingRange, ageRange };

            if (interests) {
                requestBody['interests'] = [...interests];
            }

            console.log('AgeFilter: ' + requestBody.ageRange);
            console.log('FameRatingFilter: ' + requestBody.fameRatingRange);

            const responseBody = await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_RECOMMENDED_PROFILES_API_URL, requestBody);

            console.log('recommendedProfiles: ', responseBody.recommendedProfiles);

            console.log('typeof coords: ' + typeof responseBody.recommendedProfiles[0].latitude);

            if (!responseBody || !responseBody.recommendedProfiles
                || !Array.isArray(responseBody.recommendedProfiles)
                || !responseBody.recommendedProfiles.every( (recommendedProfile: any) => isOfBackendRecommendedProfileType(recommendedProfile))) {
                console.log('hereeeee');
                setErrorOccurred(true);
                return ;
            }
 
            if (responseBody.recommendedProfiles.length == 0) {
                setNoResult(true)
                return ;
            }

            responseBody.recommendedProfiles.forEach((item: any) => item.profileInterests = new Set(item.profileInterests));
            setRecommendedProfiles(responseBody.recommendedProfiles);
            setCurrIndex(0);
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
        return ;
    }

    function handleFilterOverlayClose(newFameRatingRange: number[], newAgeRange: number[], newInterests: Set<string>) {
        setIsFilterOverlayOpen(false);
        setFameRatingRange(newFameRatingRange);
        setAgeRange(newAgeRange);
        setInterests(newInterests);
    }

    function handleFilterButtonClick() {
        setIsFilterOverlayOpen(true);
    }

    function handleRightArrowClick() {
        if (!recommendedProfiles) {
            return ;
        }

        if (currIndex === recommendedProfiles.length - 1) {
            fetchProfiles();
            return ;
        }

        setCurrIndex(currIndex + 1);
    }

    function handleLeftArrowClick() {
        if (!recommendedProfiles) {
            return ;
        }

        if (currIndex == 0) {
            setCurrIndex(recommendedProfiles.length - 1);
            return ;
        }

        setCurrIndex(currIndex - 1);
    }

    async function handleLikeButtonClick() {
        if (!recommendedProfiles) {
            return ;
        }

        try {
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_PROFILE_LIKE_API_URL + `/${recommendedProfiles[currIndex].id}`);
            setTimeout(() => {
                navigate(`/profile/${recommendedProfiles[currIndex].id}`);
            }, 300);
        }
        catch (err) {
            setErrorOccurred(true);
        }
    }

    return (
        <div className="flex justify-center w-screen pl-4 pr-4 md:pl-6 md:pr-6 lg:pl-10 lg:pr-10 xl:pl-32 xl:pr-32 2xl:pl-44 2xl:pr-44">
            { noResult && <NoResult />}
            { errorOccurred && <ErrorOccurred />}
            <div className={isFilterOverlayOpen == false || errorOccurred ? 'hidden' : ''}>
                <FilterOverlay handleFilterOverlayClose={handleFilterOverlayClose}/>
            </div>
            <div className={`pt-4 flex justify-center md:pt-6 w-screen ${errorOccurred || noResult ? 'hidden' : ''}`}>
                {recommendedProfiles && <MatchedProfile profileInfos={recommendedProfiles[currIndex]}/>}
            </div>
            <div className="fixed z-20 pb-4 bottom-1 flex justify-center gap-2 sm:gap-4">
                <button className="bg-blue-950 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center hover:scale-125 transition-transform duration-300 ease-in-out">
                    <FaArrowLeft onClick={handleLeftArrowClick} className="fill-white" size={34} />
                </button>
                <button  onClick={handleFilterButtonClick} className="bg-blue-950 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center hover:scale-125 transition-transform duration-300 ease-in-out">
                    <ImFilter className="fill-white" size={30} />
                </button>
                <button  onClick={() => setIsMapOpen(true)} className="bg-blue-950 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center hover:scale-125 transition-transform duration-300 ease-in-out">
                    <FaMap className="fill-white" size={30} />
                </button>
                <button className="bg-blue-950 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center hover:scale-125 transition-transform duration-300 ease-in-out">
                    <FaHeart onClick={handleLikeButtonClick} className="fill-white" size={30} />
                </button>
                <button className="bg-blue-950 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center hover:scale-125 transition-transform duration-300 ease-in-out">
                    <FaArrowRight onClick={handleRightArrowClick} className="fill-white" size={34} />
                </button>
            </div>
            {isMapOpen && <InteractiveMap onClose={() => setIsMapOpen(false)} recommendedProfiles={recommendedProfiles ?? []} />}
        </div>
    )
}

export default Explore;