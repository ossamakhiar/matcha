import { useEffect, useState } from "react";
import interests from "../../utils/interests";
import { sendLoggedInActionRequest } from "../../utils/httpRequests";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/generalPurpose";
import Tag from "../../components/utils/Tag";
import { CompleteProfileNextStep } from "../../types/enums";
import { toast } from "../../utils/toast";

const InterestTag = () => {
    const   [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const completeProfileCookie = getCookie('CompleteProfile');

        if (completeProfileCookie != CompleteProfileNextStep.INTERESTS_NEXT) {
            const navRoute = completeProfileCookie == undefined ? '/complete-info/1'
                : completeProfileCookie == CompleteProfileNextStep.PHOTOS_NEXT ? '/complete-info/3' : '/profile'

            setTimeout(() => {
                navigate(navRoute);
            }, 300);

            return ;
        }

        setIsLoading(false);
    }, []);

    const handleOnClick = (tag: string) => {
        setSelectedTags((prev) => {
            const newSelectedTags = new Set(prev);
            if (newSelectedTags.has(tag))
                newSelectedTags.delete(tag);
            else
                newSelectedTags.add(tag);
            return newSelectedTags;
        })
    }

    const handleContinue = async () => {
        try {
            await sendLoggedInActionRequest('POST', import.meta.env.VITE_LOCAL_COMPLETE_PROFILE_INTERESTS_API_URL, {interests: [...selectedTags]}, 'application/json');

            toast.success('Interests saved successfully');
            setTimeout(() => {
                navigate('/complete-info/3');
            }, 1000);
        }
        catch (err) {
            toast.error('Failed to save interests');
        }
    }

    if (isLoading) {
        return ;
    }

    return (
        <div className="w-full">
            <h1 className="text-xl my-9">2/3</h1>
            <h1 className=" text-4xl mb-3">Interests</h1>
            <p className="mb-4">
                Add at least 5 interests to your profile. You'll be able to discuss, engage, and meet like-minded souls in these communities.
            </p>
        

            {interests.map((tag, index) => {
                return (
                <div key={index} className="ml-4 mb-2 inline-block" onClick={() => handleOnClick(tag)}>
                    <Tag tag={tag} bgColor={selectedTags.has(tag) ? 'bg-green-light' : 'bg-white'}/>
                </div>
                )
            })}

            <div className="flex justify-end">
                <button
                    disabled={selectedTags.size < 5}
                    className={`mt-6 mb-4 px-6 py-2 bg-pastel-pink-100 ${selectedTags.size < 5 ? 'bg-opacity-75' : ''} rounded-lg font-semibold tracking-wide text-white hover:text-black  focus:ring`}
                    onClick={handleContinue}>

                    Continue
                </button>
            </div>
        </div>
    )

}

export default InterestTag;