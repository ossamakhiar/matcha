import { LuHeart } from "react-icons/lu";
import { ParticipantUser } from "../../types";


const ConversationHeader = ({id, firstName, lastName, profilePicture, status, isFavorite, onClick}: ParticipantUser & {onClick: (dmId: number) => void}) => {
    return (
        <div className="border-b h-[80px] w-full flex justify-between items-center py-2 px-5">
            <div className="pl-2 flex gap-3">
                <img src={profilePicture} className="h-16 w-16 object-cover rounded-full"/>
                <div className="flex flex-col">
                    <h1 className="text-xl">{firstName} {lastName}</h1>
                    <p className={`${status === 'online' ? 'text-green-700' : 'text-black'}`}>{status}</p>
                </div>
            </div>

            <LuHeart
                title={`${!isFavorite ? 'add to favorites' : 'remove from favorites'}`}
                size={25}
                className={`${isFavorite ? 'fill-black hover:fill-none' : 'hover:fill-black'} cursor-pointer`}
                onClick={() => onClick(id)}
            />
        </div>
    )

}

export default ConversationHeader;