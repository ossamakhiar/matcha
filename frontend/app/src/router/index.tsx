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
import InterestTag from "../pages/profile_setup/InterestTag";
import UserProfile from "../pages/profile/UserProfile";
import LoggedInLayout from "../layouts/LoggedInLayout";
import SearchResults from "../pages/search_results/SearchResults";
import History from "../pages/history/History";
import VerifyEmail from "../pages/auth/emailVerification";
import ResetPassword from "../pages/auth/resetVerification";
// import { useEffect } from "react";
import CommonLayout from "../layouts/CommonLayout";
import NotificationPage from "../pages/notification/NotificationPage";
import NotFound from "../components/utils/not-found/NotFound";
import AdvancedSearch from "../pages/explore/AdvancedSearch";
import Recommendation from "../pages/explore/Recommendation";
import ExploreGate from "../pages/explore/ExploreGate";

const router = createBrowserRouter([
    {
        path: '/',
        element: <CommonLayout><LandingPage /></CommonLayout>
    },
    // {
    //     path: '/about',
    //     element: <CommonLayout><AboutPage /></CommonLayout>
    // },
    {
      path: '/login',
      element: <GuestLayout><Login /></GuestLayout>
    },
    {
      path: '/signup',
      element: <GuestLayout><SignUp/></GuestLayout>
    },
    {
      path: '/emailVerification',
      element: <GuestLayout><VerifyEmail/></GuestLayout>
    },
    {
      path: '/passwordReset',
      element: <GuestLayout><ResetPassword/></GuestLayout>
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
          element: <InterestTag />,
        },
        {
          path: '3',
          element: <ProfileSetup />,
        },
        {
          path: '*',
          element: <div>404 Not Found -_-</div>,
        },
      ],
    },    
    {
      path: '/explore',
      element: <LoggedInLayout />,
      children: [
        {
          index: true,
          element: <ExploreGate />   // popup / choice screen
        },
        {
          path: 'recommendation',
          element: <Recommendation />
        },
        {
          path: 'advancedSearch',
          element: <AdvancedSearch />
        }
      ]
    },
    {
      path: '/chat/:conversationId?',
      element: <LoggedInLayout><Chat/></LoggedInLayout>
    },
    {
      path: '/profile/:userId',
      element: <LoggedInLayout><UserProfile/></LoggedInLayout>
    },
    {
      path: '/profile',
      element: <LoggedInLayout><UserProfile/></LoggedInLayout>
    },
    {
      path: '/history',
      element: <LoggedInLayout><History/></LoggedInLayout>
    },
    {
      path: '/search-results',
      element: <LoggedInLayout><SearchResults/></LoggedInLayout>
    },
    {
      path: '/notifications',
      element: <LoggedInLayout><NotificationPage /></LoggedInLayout>
    },
    {
      path: '*',  // Catch all other routes
      element: <NotFound />  // Display the NotFound component
    }
]);

export default router;