import { ChangeEvent, useEffect, useState } from "react";
import { MdCloudUpload } from "react-icons/md";
import ImageCard from "../../components/utils/ImageCard";
import { sendFormDataRequest } from "../../utils/httpRequests";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/generalPurpose";
import { CompleteProfileNextStep } from "../../types/enums";

type ImageCardsProps = {
    images: File[];
    handleRemove: (key: number) => void;
}


// I should pass only the image source for this component, to make things more abstract
const ImageCards = ({ images, handleRemove }: ImageCardsProps) => {
    return (
        <div className="p-3 pt-4 shadow border w-full h-72 rounded-2xl flex flex-wrap justify-center gap-4 overflow-y-auto scrollbar">
            {!images.length ? (
                <div className="text-center w-full flex justify-center items-center text-2xl">
                    Select pictures
                </div>
            ) : (
                images.map((image, index) => (
                    <ImageCard
                        key={image.name}
                        imageSrc={URL.createObjectURL(image)}
                        onRemove={() => handleRemove(index)}
                    />
                ))
            )}
        </div>
    )
}
export default function ProfileSetup() {
    const   [images, setImages] = useState<File[]>([]);
    const   [isLoading, setIsLoading] = useState(true);
    const   navigate = useNavigate();
    const   MAX_PICTURES = 4;

    useEffect(() => {
        const completeProfileCookie = getCookie('CompleteProfile');

        if (completeProfileCookie != CompleteProfileNextStep.PHOTOS_NEXT) {
            const navRoute = completeProfileCookie == undefined ? '/complete-info/1'
                : completeProfileCookie == CompleteProfileNextStep.INTERESTS_NEXT ? '/complete-info/2' : '/profile'

            setTimeout(() => {
                navigate(navRoute);
            }, 300);

            return ;
        }

        setIsLoading(false);
    }, []);

    if (isLoading) {
        return ;
    }

    const handleUploadChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        setImages((prev) => {
            const newArray: File[] = [];
            for (let i = 0; files && i < files.length && prev.length + i < MAX_PICTURES; i++) {
                newArray.push(files[i]);
            }
            return [...prev, ...newArray];
        });
        // console.log(files);
    }

    const handleRemove = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i != index))
    }

    const onConfirm = async () => {
        if (images.length === 0) {
            return ;
        }

        const formData = new FormData();

        images.forEach( (image) => {
            formData.append('image', image);
        });

        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        try {
            await sendFormDataRequest('POST', import.meta.env.VITE_LOCAL_COMPLETE_PROFILE_PHOTOS_API_URL as string, formData);

            setTimeout(() => {
                navigate('/profile');
            }, 1000);
        }
        catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="w-full pb-3">
                <h1 className="text-xl my-9">3/3</h1>
                <h1 className=" text-4xl mb-1">Upload Some Pictures</h1>
                <p className="mb-4">
                    Upload to 4 real pictures to your profile to make a stronger and more authentic connection with others
                </p>

                <label htmlFor="upload" className="mb-6">
                    <div className="flex w-full mb-10 md:justify-around"> 
                        <div className="w-full md:w-3/4 lg:w-1/2 p-7 h-48 md:h-72 flex flex-col  items-center justify-center upload-section hover:upload-section rounded-3xl  cursor-pointer" >
                            <MdCloudUpload size={65} fill="#49243E" />
                            <h1 className="text-xl text-center">Browse Files to upload</h1>
                        </div>
                    </div>
                </label>

                <input
                    id="upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadChange}
                />

                <ImageCards images={images} handleRemove={handleRemove} />

                <div className="flex justify-end">
                    <button onClick={onConfirm} className="mt-5 px-6 py-2 bg-pastel-pink-100 rounded-lg font-semibold tracking-wide text-white hover:text-black  focus:ring">
                        Confirm
                    </button>
                </div>
        </div>
    );
}