import { Link, NavLink, useNavigate } from "react-router-dom";
import './style.css'
import { useState } from "react";
import Search from "./Search";
import Notification from "../notification/Notification";
import { FaBell } from "react-icons/fa6";
import { sendLoggedInActionRequest } from "../../utils/httpRequests";
import HamburgerMenuOverlay from "./HamburgerMenuOverlay";

function LoggedInHeader() {
    let [isSearchOpen, setIsSearchOpen] = useState(false);
    let [isSmallSeachOpen, setIsSmallSearchOpen] = useState(false);
    let [isHidden, setIsHidden] = useState(false);
    let navigate = useNavigate();

    function handleSearchOpen(): void {
        setIsSearchOpen(true);
    }

    function handleSearchClose(): void {
        setIsSearchOpen(false);
        setIsSmallSearchOpen(false);
    }

    function handleSmallViewSearchClick(): void {
        setIsSmallSearchOpen(true);
    }

    async function handleLogout() {
        try {
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_LOGOUT_API_URL);

            setTimeout(() => {
                navigate('/login');
            }, 300);
        }
        catch (err) {
            console.log(err);
        }
    }

    function handleHamburgerMenuOverlayClose(navigateTo: string) {
        setIsHidden(false);

        if (!navigateTo) {
            return ;
        }

        setTimeout(() => {
            navigate(navigateTo);
        }, 300);
    }

    return (
        <div className="flex justify-between shadow bg-white lg:pl-10 lg:pr-10 xl:pl-32 xl:pr-32 2xl:pl-44 2xl:pr-44" style={isSearchOpen ? {paddingLeft: 20, paddingRight: 20} : {}} >
            <div className="flex gap-3 lg:gap-12">
                <div className={`flex items-center ${isSearchOpen ? 'hidden' : ''}`}>
                    <Link to='/'><img src="/matcha_logo.svg" alt="logo" className="scale-75 sm:scale-100 md:scale-90 lg:scale-100" width={116} height={74} style={{minWidth: 116, minHeight: 74}}/></Link>
                    <div className="sm:hidden"><i onClick={handleSmallViewSearchClick} className="p-2 scale-150 fa-sharp fa-solid fa-magnifying-glass"></i></div>
                </div>
                <Search isSmallSearchOpen={isSmallSeachOpen} handleSearchOpen={handleSearchOpen} handleSearchClose={handleSearchClose}/>
            </div>
            <nav className={`hidden md:inline-flex flex gap-4 lg:gap-6 ${isSearchOpen ? 'hidden md:hidden' : ''}`}>
                <ul className="flex items-center">
                    <li><NavLink className="p-3 lg:p-5 hover:text-pastel-pink" to='/explore'>explore</NavLink></li>
                    <li><NavLink className="p-3 lg:p-5 hover:text-pastel-pink" to='/profile'>profile</NavLink></li>
                    <li><NavLink className="p-3 lg:p-5 hover:text-pastel-pink" to='/chat'>chat</NavLink></li>
                    <li><NavLink className="p-3 lg:p-5 hover:text-pastel-pink" to='/events'>events</NavLink></li>
                    <li><NavLink className="p-3 lg:p-5 hover:text-pastel-pink" to='/history'>history</NavLink></li>
                </ul>
                <img src="/icons/nav-bar-divider.svg" alt="nav bar divider" className="h-34px mt-5" />
                <div className="flex items-center gap-1">
                    <Notification />
                    <div className="p-3 lg:p-5 cursor-pointer hover:text-pastel-pink" onClick={handleLogout}>logout</div>
                </div>
            </nav>
            {/* <div className={`md:hidden py-2 absolute z-10 top-[74px] left-0 w-full bg-gray-200 ${isHidden ? 'hidden' : ''}`}>
                <ul className='w-full flex flex-col items-center justify-center list-none'>
                    <li className="w-full"><NavLink to="/explore" className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">explore</NavLink></li>
                    <li className="w-full"><NavLink to="/profile" className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">profile</NavLink></li>
                    <li className="w-full"><NavLink to="/chat" className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">chat</NavLink></li>
                    <li className="w-full"><NavLink to="/history" className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">history</NavLink></li>
                    <li className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg" onClick={handleLogout} >logout</li>
                </ul>
            </div> */}
            {isHidden && <HamburgerMenuOverlay handleLogout={handleLogout} handleHamburgerMenuOverlayClose={handleHamburgerMenuOverlayClose} />}
            <div className={`flex justify-between md:hidden sm:gap-2 items-center ${isSearchOpen ? 'hidden' : ''}`}>
                <div className="p-2">
                    <Link to="/notifications"><FaBell size={28}  className="cursor-pointer hover:text-pastel-pink"/></Link>
                </div>
                <div className="cursor-pointer" onClick={() => { setIsHidden(!isHidden) }} style={{overflow: 'hidden'}}><i className="p-2 scale-150 fa-sharp fa-solid fa-bars p-7"></i></div>
            </div>
        </div>
    )
};

export default LoggedInHeader;
