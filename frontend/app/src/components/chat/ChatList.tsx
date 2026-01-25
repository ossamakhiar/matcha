import { DmListType } from "../../types";
import { ChatListProps } from "../../types";
import { FC, useState } from "react";
import useFetchAllAndSubscribe, { FetchedData } from "../../hooks/useFetchAllAndSubscribe";
import MessageBar from "./MessageBar";
import ChatListHeader from "./ChatListHeader";
// import useFetch from "../../hooks/useFetch";
// import { sendLoggedInActionRequest, sendLoggedInGetRequest } from "../../utils/httpRequests";


// i should add a unique and consistent key which is the dmId (since no two Dms bar will have the same id)
// to make the rendering more efficient, because sometimes i'm inserting new Dms in the front
// it will be naive to mutate every dm in the DOM redundantly (lastly i understand why the index of the array should not be used as a key)
const   DmsList = ({data, onClick} : {data: DmListType[], onClick: (id: number) => void}) => {
    return (
        <div className="w-full h-full" >
            {(data) && data.map((dm) => {
                return (
                    <div key={dm.id}  onClick={() => onClick(dm.id)}>
                        <MessageBar {...dm}/>
                    </div>
                )
            })}
        </div>
    )
}


// function    DirectMessageList({data, onClick, handleMoreDataFetching}:
//     {
//         data: DmListType[],
//         onClick: (id: number) => void,
//         handleMoreDataFetching: () => void
//     }) {
//         console.log(data);
    
//         return (
//             <div className="w-full h-full overflow-y-auto scrollbar" >
//                 {(data) && data.map((dm) => {
//                     return (
//                         <div key={dm.id}  onClick={() => onClick(dm.id)}>
//                             <MessageBar {...dm}/>
//                         </div>
//                     )
//                 })}
//             </div>
//         )
// }


function    markAsReadById(dms: DmListType[] | undefined, dmId: number): DmListType[] | undefined {
    if (!dms)
        return (dms);

    const   index = dms.findIndex((dm) => dm.id === dmId);
    if (index === -1 || dms[index].unreadCount === 0) return (dms);
    dms[index].unreadCount = 0;
    return [...dms];
}



const    ChatSearchResults = ({data, searchInput, onClick}: {searchInput: string, data: {dms: FetchedData, contacts: FetchedData, favorites: {data: DmListType[]}}, onClick: (dmId: number) => void}) => {
    const fullname = (firstName: string, lastName: string) => ((firstName + ' ' + lastName).toLowerCase());

    const dms = data.dms.data?.filter((dm) => fullname(dm.firstName, dm.lastName).includes(searchInput) || dm.username?.includes(searchInput)) || [];
    const contacts = data.contacts.data?.filter((dm) => fullname(dm.firstName, dm.lastName).includes(searchInput) || dm.username?.includes(searchInput)) || [];

    return (
        <div className="h-ful w-full pl-2">
            {
                dms.length > 0 &&
                <>
                    <div className="text-lg font-semibold">Chats</div>
                    <DmsList data={dms} onClick={onClick} />
                </>
            }
            {
                contacts.length > 0 &&
                <>
                    <div className="text-lg font-semibold">Contacts</div>
                    <DmsList data={contacts} onClick={onClick} />
                </>
            }
        </div>
    )
} 





const   ChatList: FC<ChatListProps> = ({onClick}) => {
    const   [tab, setTab] = useState<string>('dms');
    const   [searchInput, setSearchInput] = useState('');
    const   data = useFetchAllAndSubscribe();

    const handleConversationClick = (dmId: number) => {
        data.dms.setData((prev) => markAsReadById(prev, dmId))
        onClick(dmId);
    }

    const   currentTabData = data[tab as keyof typeof data].data || [];

    return (
        <div className="w-full h-full pb-1">
            {/* <SocketManager /> */}
            <ChatListHeader
                currentTab={tab}
                onTabChange={(tab) => setTab(tab)}
                onSearchChange={(search: string) => setSearchInput(search)}
            />

            <div className="flex flex-col max-h-[calc(100%-100px)] overflow-y-auto scrollbar">
                {
                    searchInput.length > 0 ?
                        <ChatSearchResults data={data} searchInput={searchInput} onClick={handleConversationClick} />
                    :
                        <DmsList
                            data={currentTabData} // *listed data 
                            onClick={handleConversationClick}
                        />
                }
                {/* <DirectMessageList data={currentTabData || []} onClick={handleContactClick} handleMoreDataFetching={handl} /> */}
            </div>
        </div>
    )
}


/*
const timerRef = useRef<NodeJS.Timeout | null>(null);

    // const scrollRefs = useRef<Record<string, number>>({ dms: 0, favorites: 0, contacts: 0 });

    const [isScrollEnabled, setScrollEnabled] = useState<boolean>(true);


    // this maps the a tab to its data, to be listed
    const   tabMap: Record<string, DmListType[] | undefined> = {
        dms: [{lastMessage: 'helllo'}, {lastMessage: 'jhfkdh'}],
        favorites: dms.data?.filter((dm) => dm.isFavorite),
        contacts: contacts.data,
    }

    const conversationOnClick = (dmId: number) => {
        dms.setData((prev) => markAsReadById(prev, dmId))
        onClick(dmId);
    }


    // fetch more data based on the current selected tab
    const handleDmListScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        if (!isScrollEnabled) {
            return ;
        }
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // scrollRefs.current[tab] = scrollTop; // Update the scroll position for the current tab

        if (scrollHeight - scrollTop <= clientHeight + 10) {

            if (tab === 'dms') {
                // when switching tabs it gets called
                // dms.fetchMoreData();
            }
            else if (tab === 'contacts') {
                // contacts.fetchMoreData();
            }
        }
    }


    useEffect(() => {
        // Reset scroll position on tab change to avoid triggering scroll events
        // const currentScrollTop = scrollRefs.current[tab];
        // document.querySelector('.scrollable-div')?.scrollTo(0, currentScrollTop);
        setScrollEnabled(false);
        const timer = setTimeout(() => setScrollEnabled(true), 2000);

        return () => clearTimeout(timer);
    }, [tab]);
    
    const   onTabSwitch = (tab: string) => {
        setScrollEnabled(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => setScrollEnabled(true), 2000);
        setTab(tab)
    }

*/


export default ChatList;