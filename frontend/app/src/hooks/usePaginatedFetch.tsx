import { useEffect, useState } from "react";
import useFetch from "./useFetch";
import { sendLoggedInGetRequest } from "../utils/httpRequests";

interface data<T> {
    data: T[] | undefined;
    setData: React.Dispatch<React.SetStateAction<T[] | undefined>>;
    fetchMoreData: () => Promise<void>;
    hasMore: boolean;
}

// the given url should not contain any query paramaters
function usePaginatedFetch<T>(url: string, uriQuery?: Record<string, string>) : data<T> {

    const queryString = uriQuery ? Object.entries(uriQuery).map(([key, value]) => `${key}=${value}`).join("&") : '';
    const initialUrl = `${url}${queryString.length > 0 ? `?${queryString}` : ''}`;

    const [data, setData] = useFetch<T[]>(initialUrl);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 20;

    useEffect(() => {
        // when url change reset the page number and hasMore state
        setPage(1);
        setHasMore(true);
    }, [initialUrl])


    const   fetchMoreData = async () => {
        if (!hasMore) {
            return
        }

        try {
            const paginatedUrl = `${url}?${queryString}&page=${page}&pageSize=${PAGE_SIZE}`;

            const data = await sendLoggedInGetRequest(paginatedUrl) as T[];
            if (data.length == 0) {
                setHasMore(false);
                return ;
            }
            setData((prev) => [...(prev || []), ...data]);
            setPage((prevPage) => prevPage + 1);
        } catch (e) {
            console.log(e);
        }
    }

    return {
        data,
        setData,
        fetchMoreData,
        hasMore
    }
}


export default usePaginatedFetch;