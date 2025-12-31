import { FaStar } from "react-icons/fa6";

type FameRatingDisplayProps = {
    starsCount: number;
    size?: number;
};

function FameRatingDisplay({starsCount, size = 25}: FameRatingDisplayProps) {
    let stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex hover:scale-110">
            {
                stars && stars.length == 5 ? 
                stars.map(
                    (star) => {
                        let color = '#D9D9D9';

                        if (star <= starsCount) {
                            color = '#FFC978';
                        }

                        return (
                            <div key={String(star)}>
                                <FaStar style={{width: size, height: size, color: `${color}`}} />
                            </div>
                        )
                    }
                )
                : null
            }
        </div>
    )
}

export default FameRatingDisplay;