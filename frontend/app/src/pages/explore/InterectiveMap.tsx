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
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { PiNavigationArrow } from "react-icons/pi";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCurrentUserInfo } from "../../context/UserProvider";
import { RecommendedProfileInfo } from "../../types/profile";
import { UserBadge } from "../../components/profile/UserBadge";

type InteractiveMapProps = {
  onClose: () => void;
  recommendedProfiles: RecommendedProfileInfo[];
};

type MapUser = {
  id: string;
  isSelf: boolean;
  firstName: string;
  lastName: string;
  userName: string;
  age: number;
  gender: string;
  sexualPreferences: string;
  biography: string;
  profilePicture: string;
  longitude: number;
  latitude: number;
  fameRating?: number;
  commonInterestsCount?: number;
};

export function InteractiveMap({ onClose, recommendedProfiles }: InteractiveMapProps) {
  const [popupInfo, setPopupInfo] = useState<MapUser | null>(null);

  const userInfo = useCurrentUserInfo();
  const ref = useOutsideClick(onClose);
  const navigate = useNavigate();

  if (!userInfo) return null;

  const users = useMemo<MapUser[]>(() => {
    const mappedRecommended = recommendedProfiles.map((user) => ({
      id: user.id,
      isSelf: false,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      age: user.age,
      gender: user.gender,
      sexualPreferences: user.sexualPreferences,
      biography: user.biography,
      profilePicture: user.profilePicture,
      longitude: user.longitude,
      latitude: user.latitude,
      fameRating: user.fameRating,
      commonInterestsCount: user.commonInterestsCount,
    }));

    const selfUser: MapUser = {
      id: userInfo.id,
      isSelf: true,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      userName: userInfo.userName,
      age: userInfo.age,
      gender: userInfo.gender,
      sexualPreferences: userInfo.sexualPreferences,
      biography: userInfo.biography,
      profilePicture: userInfo.profilePicture,
      longitude: userInfo.longitude,
      latitude: userInfo.latitude,
      fameRating: userInfo.fameRating,
    };

    return [...mappedRecommended, selfUser];
  }, [recommendedProfiles, userInfo]);

  const pins = useMemo(
    () =>
      users.map((user) => (
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
    [users]
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
                closeOnClick={false}
                onClose={() => setPopupInfo(null)}
              >
                <div className="flex w-[min(360px,85vw)] flex-col gap-3 sm:flex-row sm:items-start">
                  <img
                    src={popupInfo.profilePicture}
                    alt={`${popupInfo.firstName} ${popupInfo.lastName}`}
                    className="h-20 w-20 flex-shrink-0 rounded-lg object-cover shadow-sm"
                  />
                  <div className="flex-1 space-y-2 text-sm text-gray-800 break-words">
                    <div className="flex items-center gap-2 text-base font-semibold text-gray-900">
                      <span>
                        {popupInfo.firstName} {popupInfo.lastName}
                      </span>
                      {popupInfo.isSelf && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-gray-700">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                        @{popupInfo.userName}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {popupInfo.age} yrs
                      </span>
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                        {popupInfo.gender}
                      </span>
                    </div>
                    {popupInfo.commonInterestsCount !== undefined && (
                      <div className="text-gray-700">
                        {popupInfo.commonInterestsCount} common interest{popupInfo.commonInterestsCount === 1 ? "" : "s"}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/profile/${popupInfo.id}`)}
                      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    >
                      View profile
                    </button>
                  </div>
                </div>
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
