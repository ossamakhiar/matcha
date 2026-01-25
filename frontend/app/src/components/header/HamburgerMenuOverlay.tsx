type HamburgerMenuOverlayProps = {
    handleHamburgerMenuOverlayClose: (navigateTo: string) => void;
    handleLogout: () => void;
};

function HamburgerMenuOverlay({handleHamburgerMenuOverlayClose, handleLogout}: HamburgerMenuOverlayProps) {

    function handleBackgroundClick(e: React.MouseEvent<HTMLDivElement>) {
        const classes = (e.target as HTMLElement).classList;
        if (classes.contains('bg-black') && classes.contains('bg-opacity-40')) {
            handleHamburgerMenuOverlayClose('');
        }
    }

    return (
        <div onClick={handleBackgroundClick} className="md:hidden fixed z-10 flex justify-center items-center inset-0 bg-black bg-opacity-40">
            <div className="py-2 absolute z-10 top-[74px] left-0 w-full bg-gray-200">
                <ul className='w-full flex flex-col items-center justify-center list-none'>
                    <li onClick={() => { handleHamburgerMenuOverlayClose('/explore') }} className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">explore</li>
                    <li onClick={() => { handleHamburgerMenuOverlayClose('/profile') }} className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">profile</li>
                    <li onClick={() => { handleHamburgerMenuOverlayClose('/chat') }} className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">chat</li>
                    <li onClick={() => { handleHamburgerMenuOverlayClose('/events') }} className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">events</li>
                    <li onClick={() => { handleHamburgerMenuOverlayClose('/history') }} className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg">history</li>
                    <li className="w-full text-center block p-2 hover:text-pastel-pink hover:bg-gray-300 text-lg" onClick={handleLogout} >logout</li>
                </ul>
            </div>
        </div>
    )
}

export default HamburgerMenuOverlay;