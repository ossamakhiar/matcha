import { FC, ReactNode, useEffect, useState } from "react";
import LoggedInHeader from "../components/header/LoggedInHeader";
import SocketProvider from '../context/SocketProvider';
import { getCookie } from "../utils/generalPurpose";
import { useNavigate } from "react-router-dom";
import { sendLoggedInActionRequest } from "../utils/httpRequests";
import UserInfoProvider from "../context/UserProvider";

type Props = {
    children: ReactNode;
}

const locationUrl = "http://localhost:3000/send-location";

const LocationBootstrap = () => {
    useEffect(() => {
      if (!("geolocation" in navigator)) return;
  
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
  
          sendLoggedInActionRequest("POST", locationUrl, {
            latitude,
            longitude,
            accuracy,
          });
        },
        (err) => {
          if (err.code === err.TIMEOUT) {
            console.warn("Location timeout — ignoring");
            return;
          }
          console.error("Geolocation error:", err.message);
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: Infinity,
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

        if (completeProfileCookie != '3') {
            setTimeout(() => {
                navigate('/complete-info/1');
            }, 300);

            return ;
        }

        setIsLoading(false);
    }, [])

    if (isLoading) {
        return ;
    }

    return (
      <SocketProvider>
        <UserInfoProvider>
          <LocationBootstrap />
          <LoggedInHeader />
          {children}
        </UserInfoProvider>
      </SocketProvider>
    )
}

export default LoggedInLayout;