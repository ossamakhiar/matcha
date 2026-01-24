import GuestHeader from "../components/header/GuestHeader";
import { Outlet } from "react-router-dom";

const SetupLayout = () => {
    return (
        <>
            <GuestHeader />
            <Outlet />
        </>
    )
}

export default SetupLayout;