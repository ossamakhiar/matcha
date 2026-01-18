import { FC, ReactNode, useEffect, useState } from "react";
import LoggedInHeader from "../components/header/LoggedInHeader";
import SocketProvider from '../context/SocketProvider';
import { getCookie } from "../utils/generalPurpose";
import { Outlet, useNavigate } from "react-router-dom";
import { sendGetRequestWithoutCreds, sendLoggedInActionRequest } from "../utils/httpRequests";
import UserInfoProvider from "../context/UserProvider";
import { isOfCoordsType } from "../utils/typeGuards";
import { CompleteProfileNextStep } from "../types/enums";

type Props = {
    children?: ReactNode;
}

const locationUrl = import.meta.env.VITE_LOCAL_PROFILE_SEND_LOCATION as string;

const LocationBootstrap = () => {
    useEffect(() => {
      if (!("geolocation" in navigator)) return;
  
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log(`geolocation coords: ${latitude}, ${longitude}`);
  
          sendLoggedInActionRequest("POST", locationUrl, {
            latitude,
            longitude,
          });
        },
        async (_) => {
          // if geolocation.getCurrentPosition failed, we consider Ip fallback
          const data = await sendGetRequestWithoutCreds('http://ip-api.com/json/?fields=lat,lon');

          if (!data || !isOfCoordsType(data)) {
            console.log('IP fallback failed!!');
            return;
          }

          // store coords got from IP fallback
          const { lat, lon } = data;
          console.log(`IP fallback coords: ${lat}, ${lon}`);
          sendLoggedInActionRequest("POST", locationUrl, {
            latitude: lat,
            longitude: lon
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    }, []);
  
    return null;
  };
  

const LoggedInLayout: FC<Props> = ({children}) =>  {

    // check here that the user is logged in

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const csrfClientExposedCookie = getCookie('csrfClientExposedCookie');

        if (!csrfClientExposedCookie) {
            setTimeout(() => {
                navigate('/login');
            }, 300);

            return ;
        }

        const completeProfileCookie = getCookie('CompleteProfile');

        if (completeProfileCookie != CompleteProfileNextStep.DONE) {
            setTimeout(() => {
                navigate('/complete-info/1');
            }, 300);

            return ;
        }

        setIsLoading(false);
    }, [])

    if (isLoading) {
      return null;
    }

    return (
      <SocketProvider>
        <UserInfoProvider>
          <LocationBootstrap />
          <LoggedInHeader />
          {children ?? <Outlet />}
        </UserInfoProvider>
      </SocketProvider>
    )
}

export default LoggedInLayout;