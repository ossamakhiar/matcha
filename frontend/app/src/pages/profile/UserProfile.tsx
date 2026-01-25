import { Link, useNavigate, useParams } from "react-router-dom";
import Gender from "../../components/utils/Gender";
import SexualPreferences from "../../components/utils/SexualPreferences";
import './style.css'
import FameRatingDisplay from "../../components/utils/FameRatingDisplay";
import EditProfileButton from "../../components/profile/EditProfileButton";
import interests from "../../utils/interests";
import EditProfileOverlay from "../../components/profile/EditProfileOverlay";
import { ChangeEvent, useEffect, useState } from "react";
import EditInterestsOverlay from "../../components/profile/EditInterestsOverlay";
import LikeProfileButton from "../../components/profile/LikeProfileButton";
import UnlikeProfileButton from "../../components/profile/UnlikeProfileButton";
import LikeBackProfileButton from "../../components/profile/LikeBackProfileButton";
import { ProfileInfo } from "../../types/profile";
import { sendLoggedInActionRequest, sendLoggedInGetRequest, sendFormDataRequest } from "../../utils/httpRequests";
import AreYouSureOverlay from "../../components/profile/AreYouSureOverlay";
import ErrorOccurred from "../../components/utils/error-occurred/ErrorOccurred";
import { isOfProfileInfoType } from "../../utils/typeGuards";
import { useSocket } from "../../context/SocketProvider";
import { EventsEnum } from "../../types";
import { toast } from "../../utils/toast";

function UserProfile() {
    // ? By OUSSAMA
    const socket = useSocket();
    // ? ********

    let [profileInfo, setProfileInfo] = useState<ProfileInfo>();
    let { userId } = useParams();
    let [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
    let [isInterestsEditOpen, setIsInterestsEditOpen] = useState(false);
    let [isFakeReportAreYouSureModelOpen, setIsFakeReportAreYouSureModelOpen] = useState(false);
    let [isBlockAreYouSureModelOpen, setIsBlockAreYouSureModelOpen] = useState(false);
    let [isLoading, setIsLoading] = useState(true);
    let [errorOccurred, setErrorOccurred] = useState(false);
    let [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
    let [removingPhotoId, setRemovingPhotoId] = useState<number | null>(null);
    let [isRemovePhotoModalOpen, setIsRemovePhotoModalOpen] = useState(false);
    let [photoToRemove, setPhotoToRemove] = useState<number | null>(null);
    let navigate = useNavigate();

    const MAX_PHOTOS = 4;

    // TODO : this should be part of LoggedInLayout
    useEffect(() => {
        (async function initializeComponent() {
            setIsLoading(true);
            setErrorOccurred(false);
            try {
                const profileInfoUrl = (userId ? import.meta.env.VITE_LOCAL_PROFILE_INFO_API_URL + `/${userId}` : import.meta.env.VITE_LOCAL_CURR_PROFILE_INFO_API_URL);
                const responseBody = await sendLoggedInGetRequest(profileInfoUrl);

                if (!responseBody || !isOfProfileInfoType(responseBody.profileInfo)) {
                    setErrorOccurred(true);
                    toast.error('Failed to load profile information');
                    return ;
                }

                responseBody.profileInfo.interests = new Set(responseBody.profileInfo.interests);
                setProfileInfo(responseBody.profileInfo);

                // ? *******
                if (userId) {
                    const data = await sendLoggedInActionRequest('POST', `${import.meta.env.VITE_LOCAL_HISTORY_VISIT}/${userId}`);
                    if (data.success) // emit visit notification only when the visit history is being added (1 hour interval)
                        socket?.emit(EventsEnum.NOTIFICATION_VISIT, {targetUserId: Number(userId)});
                }
                // ? *******
            } catch(err) {
                setErrorOccurred(true);
                toast.error('An error occurred while loading the profile');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [userId]);

    if (errorOccurred) {
        return (
            <>
                <ErrorOccurred />
            </>
        )
    }

    if (isLoading) {
        return ;
    }

    if (profileInfo == undefined) {
        return ;
    }

    function handleEditButtonClick() {
        setIsProfileEditOpen(true);
    }

    async function handleLikeButtonClick() {
        if (profileInfo == undefined) {
            return ;
        }

        // send like request
        try {
            const profileInfoCopy = Object.create(profileInfo);

            profileInfoCopy.userInfo.isLiked = true;
            setProfileInfo(profileInfoCopy);
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_PROFILE_LIKE_API_URL + `/${userId}`);
            // ? BY OUSSMA *********
                socket?.emit(EventsEnum.NOTIFICATION_LIKE, {targetUserId: Number(userId)});
            // ? **************
        }
        catch (err) {
            return ;
        }
    }

    async function handleUnlikeButtonClick() {
        if (profileInfo == undefined) {
            return ;
        }

        // send like request
        try {
            const profileInfoCopy = Object.create(profileInfo);

            profileInfoCopy.userInfo.isLiked = false;
            setProfileInfo(profileInfoCopy);
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_PROFILE_UNLIKE_API_URL + `/${userId}`);
            // ? BY OUSSMA *********
            socket?.emit(EventsEnum.NOTIFICATION_UNLIKE, {targetUserId: Number(userId)});
            // ? **************
        }
        catch (err) {
            toast.error('Failed to unlike profile');
        }
    }

    function handleLikeBackButtonClick() {
        handleLikeButtonClick();
    }

    function handleEditOverlayClose(newProfileInfo: ProfileInfo | null) {
        if (newProfileInfo) {
            setProfileInfo(newProfileInfo);
        }
        setIsProfileEditOpen(false);
    }

    function handleEditInterestsClick() {
        setIsInterestsEditOpen(true);
    }

    async function handleInterestsOverlayClose(newSelectedInterests: Set<string>) {
        if (profileInfo == undefined) {
            return ;
        }

        const profileInfoCopy: ProfileInfo = {userInfo: profileInfo.userInfo, interests: new Set(newSelectedInterests), userPhotos: profileInfo.userPhotos};

        try {
            await sendLoggedInActionRequest('PATCH', import.meta.env.VITE_LOCAL_PROFILE_INTERESTS_API_URL, {interests: [...newSelectedInterests]}, 'application/json');

            setProfileInfo(profileInfoCopy);
            toast.success('Interests updated successfully');
        }
        catch (err) {
            toast.error('Failed to update interests');
        }
        finally {
            setIsInterestsEditOpen(false);
        }
    }

    async function handleBlock() {
        if (!profileInfo) {
            return ;
        }

        try {
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_PROFILE_BLOCK_API_URL + `/${userId}`);

            const profileInfoCopy = Object.create(profileInfo);

            profileInfoCopy.userInfo.isLiked = false;
            profileInfoCopy.userInfo.isLiking = false;
            setProfileInfo(profileInfoCopy);

            toast.success('User blocked successfully');
            setTimeout(() => {
                navigate('/profile');
            }, 500);
        }
        catch (err) {
            toast.error('Failed to block user');
        }
        finally {
            setIsBlockAreYouSureModelOpen(false);
        }
    }

    async function handleFakeAccountReport() {
        if (!profileInfo) {
            return ;
        }

        try {
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_PROFILE_REPORT_FAKE_API_URL + `/${userId}`);
            toast.success('Report submitted successfully');
        }
        catch (err) {
            toast.error('Failed to submit report');
        }
        finally {
            setIsFakeReportAreYouSureModelOpen(false);
        }
    }

    function handlePhotoUploadClick() {
        if (!profileInfo?.userInfo.isSelf) return;
        if (profileInfo.userPhotos.length >= MAX_PHOTOS) return;
        
        document.getElementById('photo-upload-input')?.click();
    }

    async function handlePhotoUploadChange(event: ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        
        if (!files || files.length === 0 || !profileInfo) {
            return;
        }

        const currentPhotoCount = profileInfo.userPhotos.length;
        const availableSlots = MAX_PHOTOS - currentPhotoCount;
        
        if (availableSlots <= 0) {
            toast.error('You have reached the maximum number of photos (4)');
            return;
        }

        setIsUploadingPhotos(true);

        try {
            const formData = new FormData();
            const filesToUpload = Array.from(files).slice(0, availableSlots);
            
            filesToUpload.forEach((file) => {
                formData.append('image', file);
            });

            await sendFormDataRequest(
                'POST', 
                `${import.meta.env.VITE_API_URL}/addPhotos`, 
                formData
            );

            const profileInfoUrl = import.meta.env.VITE_LOCAL_CURR_PROFILE_INFO_API_URL;
            const responseBody = await sendLoggedInGetRequest(profileInfoUrl);
            
            if (responseBody && isOfProfileInfoType(responseBody.profileInfo)) {
                responseBody.profileInfo.interests = new Set(responseBody.profileInfo.interests);
                setProfileInfo(responseBody.profileInfo);
                toast.success(`Successfully uploaded ${filesToUpload.length} photo${filesToUpload.length > 1 ? 's' : ''}`);
            }

            event.target.value = "";
        } catch (err) {
            toast.error('Failed to upload photos. Please try again.');
        } finally {
            setIsUploadingPhotos(false);
        }
    }

    function handlePhotoRemoveClick(photoId: number) {
        setPhotoToRemove(photoId);
        setIsRemovePhotoModalOpen(true);
    }

    async function handlePhotoRemove() {
        if (!profileInfo || !photoToRemove) return;

        setRemovingPhotoId(photoToRemove);
        setIsRemovePhotoModalOpen(false);

        try {
            await sendLoggedInActionRequest(
                'DELETE',
                `${import.meta.env.VITE_API_URL}/removePhoto`,
                { photoId: photoToRemove },
                'application/json'
            );

            const profileInfoUrl = import.meta.env.VITE_LOCAL_CURR_PROFILE_INFO_API_URL;
            const responseBody = await sendLoggedInGetRequest(profileInfoUrl);
            
            if (responseBody && isOfProfileInfoType(responseBody.profileInfo)) {
                responseBody.profileInfo.interests = new Set(responseBody.profileInfo.interests);
                setProfileInfo(responseBody.profileInfo);
                toast.success('Photo removed successfully');
            }
        } catch (err) {
            toast.error('Failed to remove photo. Please try again.');
        } finally {
            setRemovingPhotoId(null);
            setPhotoToRemove(null);
        }
    }

    return (
        <div className="flex justify-center mt-5 mr-4 ml-4">
            <div className="mb-6 w-full" style={{maxWidth: 1068}}>
                <div className={`${isProfileEditOpen == false ? 'hidden': ''}`}>
                    <EditProfileOverlay profileInfo={profileInfo} handleEditOverlayClose={handleEditOverlayClose}/>
                </div>
                <div className={`${isInterestsEditOpen == false ? 'hidden': ''}`}>
                    <EditInterestsOverlay userInterests={profileInfo.interests} handleInterestsOverlayClose={handleInterestsOverlayClose}/>
                </div>
                <div className="w-full flex flex-col lg:flex-row gap-6 mb-6 bg-white">
                    <div className="shadow  rounded-20px w-boxx">
                        <div className="flex gap-11 lg:gap-0 flex-col lg:flex-row items-center mb-8 mt-6 pl-4 pr-4 lg:pl-9 lg:pr-9 rounded-7px round-7px">
                            <div className="relative">
                                <Link to={profileInfo.userInfo.profilePicture} target="_blank" rel="noopener noreferrer">
                                    <div className="mr-4 sm:mr-8 w-60 h-60 sm:w-80 sm:h-80 lg:w-40 lg:h-40 bg-cover bg-no-repeat bg-center rounded-full bg-gray-300"
                                        style={{backgroundImage: `url(${profileInfo.userInfo.profilePicture})`}}>
                                    </div>
                                    <div className={`camera-icon cursor-pointer bg-gray-300 flex w-9 h-9 sm:w-12 sm:h-12 lg:w-9 lg:h-9 rounded-full justify-center items-center ${profileInfo.userInfo.isSelf == false ? 'hidden' : ''}`}>
                                        <i className="icon sm:scale-125 lg:scale-100" style={{backgroundImage: 'url("/icons/facebook-camera-icon.png")', backgroundPosition: '0px -21px', width: '20px', height: '20px', backgroundRepeat: 'no-repeat', display: 'inline-block'}}></i>
                                    </div>
                                </Link>
                            </div>
                            <div className="flex flex-col items-center sm:gap-2">
                                <div className="flex justify-center">
                                    <h3 className="text-center text-34px mr-8 font-bold">{profileInfo.userInfo.firstName} {profileInfo.userInfo.lastName}</h3>
                                </div>
                                <div className="flex">
                                    <p className="text-24px" >@{profileInfo.userInfo.userName}</p>
                                </div>
                                <div className="flex">
                                    <p style={{marginRight: 4, marginBottom: 4}} className="text-25px playfair-display">{profileInfo.userInfo.age}</p>
                                    <img src="/icons/birthday-cake.svg" alt="birthday cake icon" className="mr-4 w-6 sm:w-8" />
                                    <div className="flex w-5 sm:w-7">
                                        <Gender gender={profileInfo.userInfo.gender} iconsFolder='/icons/gender'/>
                                    </div>
                                    <div className="flex w-6 sm:w-8">
                                        <SexualPreferences sexualPreference={profileInfo.userInfo.sexualPreferences} iconsFolder='/icons/sexual-preferences' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center lg:justify-normal gap-5 items-center pl-4 pr-4 lg:pl-9 lg:pr-9 mb-4 lg:mb-9">
                            { profileInfo.userInfo.isSelf ? <EditProfileButton handleEditButtonClick={handleEditButtonClick}/>
                            : profileInfo.userInfo.isLiked ? <UnlikeProfileButton handleUnlikeButtonClick={handleUnlikeButtonClick}/>
                            : profileInfo.userInfo.isLiking ? <LikeBackProfileButton handleLikeBackButtonClick={handleLikeBackButtonClick}/>
                            : <LikeProfileButton handleLikeButtonClick={handleLikeButtonClick}/> }
                            <FameRatingDisplay starsCount={profileInfo.userInfo.fameRating}/>
                        </div>
                    </div>
                    <div className="shadow rounded-20px pb-6 pr-3 pl-3 w-boxx">
                        <h2 style={{fontSize: 30, fontWeight: 'semi-bold'}} className="risque-regular pl-2 sm:pt-6 pl-10 pb-6">Biography</h2>
                        <p style={{fontSize: 20}} className="text-center">{profileInfo.userInfo.biography}</p>
                    </div>
                </div>
                <div className="flex flex-col w-full lg:flex-row gap-6 bg-white">
                    <div className="shadow rounded-20px w-boxx pb-5">
                        <div className="flex justify-between">
                            <h2 style={{fontSize: 30, fontWeight: 'semi-bold'}} className="risque-regular pt-6 pl-2 sm:pl-6 pb-6">Photos</h2>
                            {profileInfo.userInfo.isSelf && (
                                <div 
                                    className={`cursor-pointer ${
                                        profileInfo.userPhotos.length >= MAX_PHOTOS || isUploadingPhotos
                                            ? 'opacity-50 cursor-not-allowed' 
                                            : 'hover:opacity-75'
                                    }`}
                                    onClick={handlePhotoUploadClick}
                                    title={
                                        profileInfo.userPhotos.length >= MAX_PHOTOS
                                            ? 'Maximum photos reached'
                                            : 'Upload more photos'
                                    }
                                >
                                    <img 
                                        src="/icons/upload-photo.svg" 
                                        alt="upload photo svg" 
                                        className="pt-6 pr-2 sm:pr-6"
                                    />
                                </div>
                            )}
                        </div>
                        <input
                            id="photo-upload-input"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUploadChange}
                            disabled={isUploadingPhotos || profileInfo.userPhotos.length >= MAX_PHOTOS}
                        />
                        <div className="gallery gallery-padding bt-2 pb-6">
                            {
                                profileInfo && profileInfo.userPhotos && profileInfo.userPhotos.length > 0 ?
                                profileInfo.userPhotos.map((photo) => (
                                    <div 
                                        key={photo.id}
                                        className="user-photo gallery-item bg-cover bg-no-repeat bg-center relative group"
                                        style={{backgroundImage: `url(${photo.url})`}}>
                                        {profileInfo.userInfo.isSelf && (
                                            <button
                                                onClick={() => handlePhotoRemoveClick(photo.id)}
                                                disabled={removingPhotoId === photo.id}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Remove photo"
                                            >
                                                {removingPhotoId === photo.id ? (
                                                    <span className="text-xs">...</span>
                                                ) : (
                                                    <span className="text-lg leading-none">×</span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                )) : null
                            }
                        </div>
                    </div>
                    <div className="shadow rounded-20px w-boxx">
                        <div className="flex justify-between">
                            <h2 style={{fontSize: 30, fontWeight: 'semi-bold'}} className="risque-regular pt-6 pl-2 sm:pl-10 pb-6">Interests</h2>
                            <div className={`cursor-pointer ${profileInfo.userInfo.isSelf == false ? 'hidden' : ''}`} onClick={handleEditInterestsClick}>
                                <img src="/icons/pencil.svg" width={50} height={50} alt="pencil icon" className="pt-8 pr-6"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 pl-2 lg:pl-7 pr-1 lg:grid-cols-3 grid-rows-7 gap-y-5 gap-x-2 pb-5">
                            {
                                interests.map(
                                    (interest) => (
                                        <div className={`flex justify-center tag cursor-pointer max-w-32 fit-box ${profileInfo.interests.has(interest) ? 'bg-button-pink' : ''}`}>
                                            <h3>#{interest}</h3>
                                        </div>
                                    )
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className={`flex justify-center ${profileInfo.userInfo.isSelf ? 'hidden' : ''}`}>
                    <button className="btn" onClick={ () => setIsBlockAreYouSureModelOpen(true) }><i className="fa-solid fa-user-slash"></i>block</button>
                    <button className="btn" onClick={ () => setIsFakeReportAreYouSureModelOpen(true) }><i className="fa-solid fa-masks-theater"></i>fakeAccount</button>
                </div>
                {isBlockAreYouSureModelOpen && <AreYouSureOverlay actionType="Block" onContinue={handleBlock} onCancel={() => setIsBlockAreYouSureModelOpen(false)}/>}
                {isFakeReportAreYouSureModelOpen && <AreYouSureOverlay actionType="ReportFakeAccout" onContinue={handleFakeAccountReport} onCancel={() => setIsFakeReportAreYouSureModelOpen(false)}/>}
                {isRemovePhotoModalOpen && (
                    <AreYouSureOverlay 
                        actionType="Remove Photo" 
                        onContinue={handlePhotoRemove} 
                        onCancel={() => {
                            setIsRemovePhotoModalOpen(false);
                            setPhotoToRemove(null);
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default UserProfile;
