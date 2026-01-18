

import { useState } from "react";
import FameRatingFilter from "./FameRatingFilter";
import InterestsInput from "../utils/InterestsInput";
import AgeGapFilter from "./age-gap-filter/AgeGapFilter";
import GeoLocationFilter from "./GeoLocationFilter";
import { SortOption } from "../../types/explore";


type FilterOverlayProps = {
  handleFilterOverlayClose: (
    fameRatingRange: number[],
    ageRange: number[],
    interests: Set<string>,
    maxDistanceKm: number,
    sortBy: SortOption
  ) => void;
};

function FilterOverlay({ handleFilterOverlayClose }: FilterOverlayProps) {
  // filter states
  const [minFameRating, setMinFameRating] = useState(0);
  const [maxFameRating, setMaxFameRating] = useState(5);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(30);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set([]));
  const [maxDistanceKm, setMaxDistanceKm] = useState(500);

  // sort state
  const [sortBy, setSortBy] = useState<SortOption>(null);

  // close overlay if clicking outside
  function handleBackgroundClick(e: React.MouseEvent<HTMLDivElement>) {
    const classes = (e.target as HTMLElement).classList;
    if (classes.contains("bg-black") && classes.contains("bg-opacity-40")) {
      handleFilterOverlayClose(
        [minFameRating, maxFameRating],
        [minAge, maxAge],
        selectedInterests,
        maxDistanceKm,
        sortBy
      );
    }
  }

  function handleClose() {
    handleFilterOverlayClose(
      [minFameRating, maxFameRating],
      [minAge, maxAge],
      selectedInterests,
      maxDistanceKm,
      sortBy
    );
  }

  // filter handlers
  function handleFameRatingFilterApply(min: number, max: number) {
    setMinFameRating(min);
    setMaxFameRating(max);
  }

  function handleInterestsFilterApply(newSelectedInterests: Set<string>) {
    setSelectedInterests(new Set(newSelectedInterests));
  }

  function handleAgeGapFilterApply(newMin: number, newMax: number) {
    setMinAge(newMin);
    setMaxAge(newMax);
  }

  function handleGeoLocationFilterApply(distanceKm: number) {
    setMaxDistanceKm(distanceKm);
  }

  return (
    <div
      onClick={handleBackgroundClick}
      className="fixed z-30 flex justify-center items-center inset-0 bg-black bg-opacity-40"
    >
      <div
        className="bg-white overflow-y-auto rounded-18px flex flex-col h-full w-full max-w-[550px] overlay-slide"
        style={{ maxHeight: 813 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center w-full mt-4 mb-4 px-5">
          <h2 style={{ fontSize: 30 }}>Filters</h2>
          <img
            src="/icons/overlay-cross-icon.svg"
            alt="cross icon"
            className="cursor-pointer"
            width={44}
            height={44}
            onClick={handleClose}
          />
        </div>

        <hr className="divider" />

        {/* Sort Dropdown */}
        <div className="ml-4 mt-4 mb-6">
          <label className="block mb-2 font-bold text-lg" htmlFor="sortBy">
            Sort by:
          </label>
            <div className="relative w-full max-w-xs">
            <select
                id="sortBy"
                className="block w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy || ""}
                onChange={(e) => {
                const value = e.target.value;
                setSortBy(value === "" ? null : (value as SortOption));
                }}
            >
                <option value="">None</option>
                <option value="fame">Fame Rating</option>
                <option value="age">Age</option>
                <option value="distance">Distance</option>
                <option value="interests">Interests</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                >
                <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.063a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                />
                </svg>
            </div>
            </div>

        </div>

        {/* Filters */}
        <div className="ml-4 flex flex-col gap-10 mt-4 pb-6">
          <div>
            <h3 style={{ fontSize: 23, fontWeight: "bold" }} className="mb-2">
              Filter by Fame Rating:
            </h3>
            <div className="flex flex-col gap-4 ml-4">
              <FameRatingFilter
                minFameRatingProp={minFameRating}
                maxFameRatingProp={maxFameRating}
                handleFilterApply={handleFameRatingFilterApply}
              />
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 23, fontWeight: "bold" }} className="mb-4">
              Filter by Interests:
            </h3>
            <InterestsInput
              initialySelectedInterests={selectedInterests}
              handleInterestsSave={handleInterestsFilterApply}
            />
          </div>

          <div>
            <h3 style={{ fontSize: 23, fontWeight: "bold" }} className="mb-4">
              Filter by Age:
            </h3>
            <AgeGapFilter
              initialMinAge={minAge}
              initialMaxAge={maxAge}
              handleAgeGapFilterApply={handleAgeGapFilterApply}
            />
          </div>

          <div>
            <h3 style={{ fontSize: 23, fontWeight: "bold" }} className="mb-4">
              Filter by Distance:
            </h3>
            <GeoLocationFilter
              initialMaxDistanceKm={maxDistanceKm}
              handleGeoLocationFilterApply={handleGeoLocationFilterApply}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterOverlay;