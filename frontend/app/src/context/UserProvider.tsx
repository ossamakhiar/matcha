


import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { UserInfos } from '../types/profile';
import { sendLoggedInGetRequest } from '../utils/httpRequests';
// import { isOfProfileInfosType } from '../utils/typeGuards';

type Props = {
    children: ReactNode;
}

const   UserInfoContext = createContext<UserInfos | null>(null);

const   UserInfoProvider = ({children}: Props) => {
    const [profileInfos, setProfileInfos] = useState<UserInfos | null>(null)
    // const [errors, setErrorOccurred] = useState<boolean>(false)

    useEffect(() => {
        (async function initializeComponent() {
            try {

                const profileInfosUrl = import.meta.env.VITE_LOCAL_CURR_PROFILE_INFOS_API_URL;
                const responseBody = await sendLoggedInGetRequest(profileInfosUrl);
            
                // if (!responseBody || !isOfProfileInfosType(responseBody.profileInfos)) {
                //     setErrorOccurred(true);
                //     return ;
                // }

                setProfileInfos(responseBody.profileInfos.userInfos);
            } catch(err) {
                console.log(err)
                // setErrorOccurred(true);
            }
        })();
    }, [])


    return (
        <UserInfoContext.Provider value={profileInfos}>
            {children}
        </UserInfoContext.Provider>
    )
}

export const useCurrentUserInfo = () => useContext(UserInfoContext);

export default UserInfoProvider;