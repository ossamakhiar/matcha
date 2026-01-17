import { FC, ReactNode } from "react";
import GuestHeader from "../components/header/GuestHeader";
import { getCookie } from "../utils/generalPurpose";

type Props = {
    children: ReactNode;
}

import { Navigate } from "react-router-dom";

const GuestLayout: FC<Props> = ({children}) =>  {
    const csrfClientExposedCookie = getCookie('csrfClientExposedCookie');

    if (csrfClientExposedCookie) {
        const completeProfileCookie = getCookie('CompleteProfile');

        if (completeProfileCookie != '3') {
            return <Navigate to="/complete-info/1" replace />;
        }

        return <Navigate to="/profile" replace />;
    }

    return (
        <>
            <GuestHeader />
            {children}
        </>
    )
}

export default GuestLayout;