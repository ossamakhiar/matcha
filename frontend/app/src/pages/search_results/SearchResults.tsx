import { Link, useLocation } from "react-router-dom";
// import dummySearchResults from "../../components/utils/dummySearchResults";
import SexualPreferences from "../../components/utils/SexualPreferences";
import Gender from "../../components/utils/Gender";
import './style.css'
import usePaginatedFetch from "../../hooks/usePaginatedFetch";
import { UserInfo } from "../../types/profile";

function SearchResults() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const SearchQuery = queryParams.get('query');

    const {data, fetchMoreData, hasMore} = usePaginatedFetch<UserInfo>(import.meta.env.VITE_LOCAL_SEARCH, {s: SearchQuery || ''});
    // i should update the way usePaginatedFetch handles query, by extartcing all the queries string first from the given url and then add the page and pageSize

    // need to implement a search results logic in a seperate module
    return (
        <div className="overflow-hidden shadow rounded-20px flex flex-col ml-3 mt-3 mr-3 sm:ml-6 sm:mr-6 sm:mt-6 md:mt-8 md:ml-8 md:mr-8 lg:ml-10 lg:mr-10 xl:ml-32 xl:mr-32 2xl:ml-44 2xl:mr-44 bg-white">
            <h1 className="text-3xl font-semibold pl-5 sm:pl-12 pb-12"> Results</h1>
            <div className="md:pl-0 sm:pl-14">
                {
                    data && data.length > 0 ?
                    data.map(
                        (result) => (
                            <div key={result.id} className="flex items-center mb-8 pt-3 pb-3 pl-5 rounded-7px search-result-bg round-7px">
                                <Link to={`/profile/${result.id}`}>
                                    <div className="mr-4 sm:mr-8 w-24 h-24 sm:w-40 sm:h-40 lg:h-40 lg:w-40 bg-cover bg-no-repeat bg-center rounded-full bg-gray-300"
                                        style={{backgroundImage: `url(${result.profilePicture})`}}>
                                    </div>
                                </Link>
                                <div className="flex flex-col sm:gap-2">
                                    <div className="flex">
                                        <Link to={`/profile/${result.id}`}><h3 className="text-fullname mr-8 font-bold">{result.firstName} {result.lastName}</h3></Link>
                                    </div>
                                    <div className="flex">
                                        <p className="text-username" >@{result.userName}</p>
                                    </div>
                                    <div className="flex">
                                        <p style={{marginRight: 4, marginBottom: 4}} className="text-age playfair-display">{result.age}</p>
                                        <img src="/icons/birthday-cake.svg" alt="birthday cake icon" className="mr-4 w-6 sm:w-8" />
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
                <div className="w-full flex justify-center p-1 bg-gray-50 hover:bg-gray-100">
                {
                    hasMore && data && data.length > 0 ? 
                    <button onClick={fetchMoreData} className="w-full hover:gray-100 italic">load more</button>
                    : <p className="text-gray-500 italic">no more history</p>
                }
                </div>
            </div>
        </div>
    )
}

export default SearchResults;