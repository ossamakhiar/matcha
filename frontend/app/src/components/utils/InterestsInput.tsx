import { useState } from "react";
import ApplyCancelButtons from "./ApplyCancelButtons";
import interests from "../../utils/interests";

type interestsInputProps = {
    initialySelectedInterests: Set<string>;
    handleInterestsSave: (newSelectedinterests: Set<string>) => void;
};

function interestsInput({initialySelectedInterests, handleInterestsSave}: interestsInputProps) {
    let [selectedInterests, setSelectedInterests] = useState(new Set(initialySelectedInterests));

    function addSelectedInterest(selectedInterest: string) {
        let selectedInterestsCopy = new Set(selectedInterests);
        
        selectedInterestsCopy.has(selectedInterest) ? selectedInterestsCopy.delete(selectedInterest)
        : selectedInterestsCopy.add(selectedInterest);
        
        setSelectedInterests(new Set(selectedInterestsCopy));
    }

    function handleCancel() {
        setSelectedInterests(new Set(initialySelectedInterests));
    }

    function handleApply() {
        handleInterestsSave(selectedInterests);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 pl-2 lg:pl-7 pr-2 grid-cols-3 grid-rows-7 gap-y-5 gap-x-2 pb-5">
                {
                    interests.map(
                        (interest) => {
                            return (
                                <div onClick={() => addSelectedInterest(interest)} key={interest} className={`flex justify-center tag cursor-pointer max-w-32 fit-box ${selectedInterests.has(interest) ? 'bg-button-pink' : ''}`}>
                                    <h3>#{interest}</h3>
                                </div>
                            )
                        }
                    )
                }
            </div>
            <div className="mt-4 mr-4">
                <ApplyCancelButtons width={90} height={40} handleCancel={handleCancel} handleApply={handleApply} />
            </div>
        </div>
    )
}

export default interestsInput;