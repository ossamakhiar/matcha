


import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { UserInfo } from '../types/profile';
import { sendLoggedInGetRequest } from '../utils/httpRequests';
// import { isOfProfileInfoType } from '../utils/typeGuards';

type Props = {
    children: ReactNode;
}

const   UserInfoContext = createContext<UserInfo | null>(null);

const   UserInfoProvider = ({children}: Props) => {
    const [profileInfo, setProfileInfo] = useState<UserInfo | null>(null)
    // const [errors, setErrorOccurred] = useState<boolean>(false)

    useEffect(() => {
        (async function initializeComponent() {
            try {

                const profileInfoUrl = import.meta.env.VITE_LOCAL_CURR_PROFILE_INFO_API_URL;
                const responseBody = await sendLoggedInGetRequest(profileInfoUrl);
            
                // if (!responseBody || !isOfProfileInfoType(responseBody.profileInfo)) {
                //     setErrorOccurred(true);
                //     return ;
                // }

                setProfileInfo(responseBody.profileInfo.userInfo);
            } catch(err) {
                console.log(err)
                // setErrorOccurred(true);
            }
        })();
    }, [])


    return (
        <UserInfoContext.Provider value={profileInfo}>
            {children}
        </UserInfoContext.Provider>
    )
}

export const useCurrentUserInfo = () => useContext(UserInfoContext);

export default UserInfoProvider;