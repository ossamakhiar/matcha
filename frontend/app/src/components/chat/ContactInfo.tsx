import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoHeartDislikeSharp } from "react-icons/io5";
import { MdBlockFlipped } from "react-icons/md";
import useOutsideClick from "../../hooks/useOutsideClick";
import { IconType } from "react-icons";
import { useActiveDm } from "../../context/activeDmProvider";
import useFetch from "../../hooks/useFetch";
import { ContactDetailsType, EventsEnum } from "../../types";
import { prepareSocketEventRegistration } from "../../utils/socket";
import { useSocketEventRegister } from "../../hooks/useSocketEventResgiter";
import { Link } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";
import { sendLoggedInActionRequest } from "../../utils/httpRequests";
import eventObserver from "../../utils/eventObserver";

type    DropdownItemType = {
    title: string,
    onClick: () => void,
    icon: IconType,
}

const DropdownItem = ({title, Icon, onClick} : {title: string, Icon: IconType, onClick: () => void}) => {
    return (
        <button className="p-1 w-full border-b hover:bg-gray-100 flex justify-center items-center gap-1" onClick={() => onClick()}>
            <Icon  size={15} className="fill-gray-600" />
            <p className="text-gray-600">{title}</p>
        </button>
    )
}

const Dropdown = ({dropdowns} : {dropdowns: DropdownItemType[]}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useOutsideClick(() => setIsOpen(false));


    const handleDropdown = () => {
        setIsOpen((prev) => !prev);
    }

    return (
        <div ref={dropdownRef} className="self-end relative w-[150px] z-20">
            <div className="absolute right-0">
                <button onClick={handleDropdown}>
                    <BsThreeDotsVertical size={20} className="hover:fill-gray-600" />
                </button>
            </div>
            {isOpen && 
                <div className='absolute right-5 w-full shadow-lg bg-white border rounded-lg overflow-hidden'>

                    {dropdowns.map((dropdownItem) => {
                        const   {title, onClick, icon} = dropdownItem;
                        return <DropdownItem key={title} title={title} onClick={onClick} Icon={icon} />
                    })}

                </div>
            }
        </div>
    )
}


function registerEventHandlers(setContactDetails: React.Dispatch<React.SetStateAction<ContactDetailsType | undefined>>) {
    const { activeDmId } = useActiveDm();

    const   presenceChangeHandler = (onlineUsers: number[]) => {
        const status = onlineUsers.indexOf(activeDmId) !== -1 ? 'online' : 'offline';
        setContactDetails((prev) => {
            if (!prev || status === prev.status)
                return (prev);
            return {...prev, status}
        })
    }

    const   registrarFunction = prepareSocketEventRegistration([
        [EventsEnum.GLOBAL_PRESENCE, presenceChangeHandler],
    ])

    useSocketEventRegister(registrarFunction, [activeDmId]);
}


function getDropdownItems() : DropdownItemType[] {
    const   {activeDmId, setActiveDmId} = useActiveDm();
    const   socket = useSocket();
    const   dropdowns: DropdownItemType[] = [];

    const   handleBlock = async () => {
        try {
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_PROFILE_BLOCK_API_URL + `/${activeDmId}`);
            eventObserver.publish(EventsEnum.APP_BLOCK_CHAT_UNLIKE, activeDmId);
            setActiveDmId(-1);
        }
        catch (err) {
            console.log(err);
        }
        // emit the Block event to the Dms List  Component
    }

    const   handleUnlike = async () => {
        // http unlike the user
        try {
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_PROFILE_UNLIKE_API_URL + `/${activeDmId}`);
            // ? BY OUSSMA *********
            socket?.emit(EventsEnum.NOTIFICATION_UNLIKE, {targetUserId: activeDmId});
            // ? **************
            eventObserver.publish(EventsEnum.APP_BLOCK_CHAT_UNLIKE, activeDmId);
            setActiveDmId(-1);
        }
        catch (err) {
            console.log(err);
        }
        console.log(`unlike ${activeDmId}`);
    }


    dropdowns.push({title: 'Block', onClick: handleBlock, icon: MdBlockFlipped});
    dropdowns.push({title: 'Unlike', onClick: handleUnlike, icon: IoHeartDislikeSharp});
    return dropdowns;
}



const ContactInfo = () => {
    const { activeDmId } = useActiveDm();
    const [contactDetails, setContactDetails] = useFetch<ContactDetailsType>(`${import.meta.env.VITE_LOCAL_CHAT_CONTACT_INFO}/${activeDmId}`, [activeDmId]);

    console.log(contactDetails)
    registerEventHandlers(setContactDetails);

    const dropdowns = getDropdownItems();

    return (
        <div className="p-2 w-full h-full overflow-y-auto scrollbar">
            {
                contactDetails && 
                <div className="flex flex-col items-center">
                    <Dropdown dropdowns={dropdowns} />

                    <img src={contactDetails.profilePicture} className=" h-40 w-40 object-cover rounded-full p-1 bg-pink" />
                    <h1 className="text-xl">{contactDetails.firstName + " " + contactDetails.lastName}</h1>
                    <p className={`${contactDetails.status === 'online' ? 'text-green-700' : 'text-black'} mb-3`}>{contactDetails.status}</p>
                    <Link to={`/profile/${activeDmId}`} className="w-[80%] bg-black text-white p-2 rounded-lg hover:text-pink text-center">View Profile</Link>
                    <span className="border my-4 w-full" />
                    <div className="self-start flex flex-col items-start mb-4">
                        <h1 className="text-xl font-semibold tracking-wide">username</h1>
                        <p>@{contactDetails.username}</p>
                    </div>
                    <div className="self-start flex flex-col items-start">
                        <h1 className="text-xl font-semibold tracking-wide">Biography</h1>
                        <p>{contactDetails.biography}</p>
                    </div>
                </div>
            }
        </div>
    )
}


export default ContactInfo;