import React, { useState } from "react";
import ApplyCancelButtons from "../utils/ApplyCancelButtons";

const MIN_DISTANCE = 1;
const MAX_DISTANCE = 500;

type GeoLocationFilterProps = {
    initialMaxDistanceKm: number;
    handleGeoLocationFilterApply: (distanceKm: number) => void;
};

function GeoLocationFilter({
    initialMaxDistanceKm,
    handleGeoLocationFilterApply
}: GeoLocationFilterProps) {
    const [distanceKm, setDistanceKm] = useState(Math.min(Math.max(initialMaxDistanceKm, MIN_DISTANCE), MAX_DISTANCE));

    function handleDistanceChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDistanceKm(Number(e.target.value));
    }

    function handleCancel() {
        setDistanceKm(initialMaxDistanceKm);
    }

    function handleApply() {
        handleGeoLocationFilterApply(distanceKm);
    }

    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4 ml-4">
                <input
                    type="range"
                    min={MIN_DISTANCE}
                    max={MAX_DISTANCE}
                    value={distanceKm}
                    onChange={handleDistanceChange}
                    className="slider"
                />
                <div className="text-lg font-medium">
                    Show users within <span className="font-bold">{distanceKm} km</span>
                </div>
            </div>

            <div className="mr-4">
                <ApplyCancelButtons
                    width={90}
                    height={40}
                    handleCancel={handleCancel}
                    handleApply={handleApply}
                />
            </div>
        </div>
    );
}

export default GeoLocationFilter;
