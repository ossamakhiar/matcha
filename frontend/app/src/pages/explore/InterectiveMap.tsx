import {
  Map,
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import useOutsideClick from "../../hooks/useOutsideClick";
import { FaX } from "react-icons/fa6";
import { useEffect, useMemo, useState } from "react";
// import { PiNavigationArrow } from "react-icons/pi";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCurrentUserInfo } from "../../context/UserProvider";
import { UserInfos } from "../../types/profile";
import { sendLoggedInGetRequest } from "../../utils/httpRequests";
import { isOfUserInfosType } from "../../utils/typeGuards";
import { UserBadge } from "../../components/profile/UserBadge";

type InteractiveMapProps = {
  onClose: () => void;
};

// TODO : might worth adding an endpoint, to return all of them directly.
function useSearchAllUsers(): UserInfos[] {
  const [allUsers, setUsers] = useState<UserInfos[]>([]);

  async function searchUsers(
    page: number,
    pageSize: number
  ): Promise<UserInfos[]> {
    const base = import.meta.env.VITE_LOCAL_SEARCH as string;

    const url = new URL(base);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));

    try {
      const data: unknown = await sendLoggedInGetRequest(url.toString());

      if (Array.isArray(data) && data.every(isOfUserInfosType)) return data;

      console.warn("searchUsers: API returned unexpected shape", data);
      return [];
    } catch (err) {
      console.error("searchUsers failed", err);
      return [];
    }
  }

  useEffect(() => {
    const getAllUser = async () => {
      const allUsers: UserInfos[] = [];
      let page = 0;
      let returned: number = 0;
      do {
        const users = await searchUsers(page, 100);
        allUsers.push(...users);
        returned = users.length;
      } while (returned === 100);
      setUsers(allUsers);
    };

    getAllUser();
  }, []);

  return allUsers;
}

export function InteractiveMap({ onClose }: InteractiveMapProps) {
  const [popupInfo, setPopupInfo] = useState<any>(null);

  const allUsers = useSearchAllUsers();
  const userInfo = useCurrentUserInfo();
  const ref = useOutsideClick(onClose);

  console.log(userInfo);
  if (!userInfo) return null;

  const pins = useMemo(
    () =>
      allUsers.map((user) => (
        <Marker
          key={`${user.id}`}
          longitude={user.longitude}
          latitude={user.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(user);
          }}
        >
          <UserBadge user={user} />
        </Marker>
      )),
    [allUsers]
  );

  return (
    <div className="fixed z-30 flex justify-center items-center inset-0 bg-black bg-opacity-40">
      <div ref={ref} className="bg-white w-3/4 h-3/4 overflow-y-auto relative">
        <div className="w-full h-full">
          <Map
            style={{ width: "100%", height: "100%" }}
            initialViewState={{
              latitude: userInfo.latitude,
              longitude: userInfo.longitude,
              zoom: 13,
              bearing: 0,
              pitch: 0,
            }}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          >
            <GeolocateControl position="top-left" />
            <FullscreenControl position="top-left" />
            <NavigationControl position="top-left" />
            <ScaleControl />
            {pins}

            {popupInfo && (
              <Popup
                anchor="top"
                longitude={Number(popupInfo.longitude)}
                latitude={Number(popupInfo.latitude)}
                onClose={() => setPopupInfo(null)}
              >
                <div>
                  {popupInfo.city}, {popupInfo.state} |{" "}
                  <a
                    target="_new"
                    href={`http://en.wikipedia.org/w/index.php?title=Special:Search&search=${popupInfo.city}, ${popupInfo.state}`}
                  >
                    Wikipedia
                  </a>
                </div>
                <img width="100%" src={popupInfo.image} />
              </Popup>
            )}
          </Map>
        </div>
        <button onClick={onClose} className="absolute right-2 top-2">
          <FaX className="fill-white" size={20} />
        </button>
      </div>
    </div>
  );
}
