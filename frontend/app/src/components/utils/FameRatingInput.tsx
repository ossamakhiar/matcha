import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa6";

type FameRatingInputProps = {
    initialStarsCount: number;
    minStarsCount: number;
    maxStarsCount: number;
    size: number;
    handleChange: (starsCount: number) => void;
};

function FameRatingInput({initialStarsCount = 0, minStarsCount = 0, maxStarsCount = 5, size = 30, handleChange}: FameRatingInputProps) {
    const stars = [1, 2, 3, 4, 5];
    const [hoveredStar, setHoveredStar] = useState(initialStarsCount);
    const [lastClickedStar, setLastClickedStar] = useState(initialStarsCount);

    useEffect(() => {
        setHoveredStar(initialStarsCount);
        setLastClickedStar(initialStarsCount);
    }
    , [initialStarsCount]);

    function handleMouseEnter(star: number) {
        if (star < minStarsCount || star > maxStarsCount) {
            return ;
        }

        setHoveredStar(star);
    }

    function handleMouseLeave() {
        setHoveredStar(lastClickedStar);
    }

    function handleClick(star: number) {
        if (star < minStarsCount || star > maxStarsCount) {
            return ;
        }

        let newRating = star;

        // checking if the user wants to reset the rating to 0
        if (minStarsCount == 0 && star == lastClickedStar) {
            newRating = 0;
        }

        setLastClickedStar(newRating);
        handleChange(newRating);
    }

    return (
        <div className="flex">
            {
                stars && stars.length == 5 ?
                stars.map(
                    (star) => {
                        let color = '#D9D9D9';

                        if (star <= hoveredStar) {
                            color = '#FFC978';
                        }

                        return (
                            <div key={String(star)}>
                                <FaStar onClick={() => handleClick(star)} onMouseEnter={() => handleMouseEnter(star)} onMouseLeave={handleMouseLeave} style={{width: size, height: size, color: `${color}`}} />
                            </div>
                        )
                    }
                )
                : null
            }
        </div>
    )
}

export default FameRatingInput;