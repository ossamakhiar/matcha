import { useEffect, useState } from "react"
import { sendLoggedInGetRequest } from "../utils/httpRequests";

// type UseFetchType<T> = (url: string, dependency?: any[]) => 

function useFetch<T>(url: string, dependency?: any[]): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>, any] {
    const   [data, setData] = useState<T>();
    const   [error, setError] = useState<string | null>(null);

    // define which function to call sendLoggedInGetRequest if it get request, using it by default
    useEffect(() => {
        const fetchData =  async () => {
            try {
                const data = await sendLoggedInGetRequest(url);
                setData(data);
            } catch (error) {
                setError(`fetch error: something went wrong`);
            }
        }

        fetchData();
    }, [url, ...(dependency ? dependency : [])])

    return [data, setData, error];
}

export default useFetch;