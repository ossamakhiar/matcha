import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/auth/login";
import ProfileSetup from "../pages/profile_setup/ProfileSetup";
import GuestLayout from "../layouts/GuestLayout";
import SetupLayout from "../layouts/SetupLayout";
import SignUp from "../pages/auth/signup";
import LandingPage from "../pages/LandingPage";
import Chat from "../pages/chat/Chat";
import PersonalInfo from "../pages/profile_setup/PersonalInfo";
import CompleteInfo from "../pages/profile_setup/CompleteInfo";

const router = createBrowserRouter([
    {
        path: '/',
        element: <GuestLayout><LandingPage /></GuestLayout>
    },
    {
      path: '/login',
      element: <GuestLayout><Login /></GuestLayout>
    },
    {
      path: '/signup',
      element: <GuestLayout><SignUp/></GuestLayout>
    },
    {
      path: '/chat',
      element: <GuestLayout><Chat/></GuestLayout>
    },
    {
      path: '/complete-info',

      element: <SetupLayout><CompleteInfo /></SetupLayout>,
      children: [
        {
          path: '1',
          element: <PersonalInfo />,
        },
        {
          path: '2',
          element: <ProfileSetup />,
        },
        {
          path: '*',
          element: <div>404 Not Found -_-</div>,
        },
      ],
    },

]);

export default router;