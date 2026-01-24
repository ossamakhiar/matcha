import { useNavigate } from "react-router-dom";

export default function ExploreGate() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Explore</h1>
        <p className="text-gray-500 mb-8">
          How would you like to discover profiles?
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Recommended Profiles Button */}
          <button
            onClick={() => navigate("recommendation")}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-rose-200 text-white-700 font-medium hover:bg-rose-300 transition shadow-md"
          >
            <span>❤️</span>
            <span>Recommended</span>
          </button>

          {/* Advanced Search Button */}
          <button
            onClick={() => navigate("advancedSearch")}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-300 transition shadow-sm"
          >
            <span>🔍</span>
            <span>Advanced Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
