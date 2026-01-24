import { Link } from "react-router-dom";
import Gender from "../../components/utils/Gender";
import SexualPreferences from "../../components/utils/SexualPreferences";
// import dummySearchResults from "../../components/utils/dummySearchResults";
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { BriefProfileInfoPresence } from "../../types/profile";

function History() {
    const {data: historyResults, fetchMoreData, hasMore} = usePaginatedFetch<BriefProfileInfoPresence>(import.meta.env.VITE_LOCAL_HISTORY);


    return (
        <div className="py-2 shadow rounded-20px flex flex-col ml-3 mt-3 mr-3 sm:ml-6 sm:mr-6 sm:mt-6 md:mt-8 md:ml-8 md:mr-8 lg:ml-10 lg:mr-10 xl:ml-32 xl:mr-32 2xl:ml-44 2xl:mr-44 bg-white">
            <h1 className="text-3xl font-semibold pl-5 sm:pl-12 pb-12">History</h1>
            <div className="pl-0 sm:pl-14">
            {
                historyResults && historyResults.length > 0 ?
                historyResults.map(
                    (result) => (
                        <div className="flex items-center mb-8 py-1 pl-3 rounded-7px search-result-bg round-7px">
                            <Link to={`/profile/${result.id}`}>
                                <div className="mr-4 sm:mr-8 w-24 h-24 sm:w-32 sm:h-32 lg:h-32 lg:w-32 bg-cover bg-no-repeat bg-center rounded-full bg-gray-300"
                                    style={{backgroundImage: `url(${result.profilePicture})`}}>
                                </div>
                            </Link>
                            <div className="flex flex-col sm:gap-2">
                                <div className="flex">
                                    <Link to={`/profile/${result.id}`}><h3 className="text-2xl mr-8 font-bold">{result.firstName} {result.lastName}</h3></Link>
                                </div>
                                <div className="flex">
                                    <p className="" >@{result.userName}</p>
                                </div>
                                <div className="flex items-center">
                                    <p className="mr-1">{result.age}</p>
                                    <img src="/icons/birthday-cake.svg" alt="birthday cake icon" className="mr-4 w-4 sm:w-6" />
                                    <div className="flex w-5 sm:w-7">
                                        <Gender gender={result.gender} iconsFolder='/icons/gender'/>
                                    </div>
                                    <div className="flex w-6 sm:w-8">
                                        <SexualPreferences sexualPreference={result.sexualPreferences} iconsFolder='/icons/sexual-preferences' />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )
                : null
            }
            <div className="w-full flex justify-center text-gray-500 font-italic">
                {
                    hasMore && historyResults && historyResults.length > 0 ? 
                    <button onClick={fetchMoreData} className="w-full italic hover:text-gray-800">load more</button>
                    : <p className="italic">no more history</p>
                }
            </div>
            </div>
        </div>
    )
}

export default History;