import {
  Bracket as BracketType,
  Team,
  Seed,
  Round,
} from "@/Pages/Bracket/components/bracketTypes";
import { useState, useEffect } from "react";
import Bracket from "@/Pages/Bracket/components/bracket";

export default function LiveBracketPage() {
  // use state var to set live bracket
  const [liveBracket, setLiveBracket] = useState<BracketType>({} as BracketType);
  // does not show info while waiting/loading info from the api
  const [error, setError] = useState<String>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function grab_live_bracket_info() {
      try {
        const response = await fetch("http://localhost:8000/format_bracket");
        if (!response.ok) {
          throw new Error("Failed to fetch brackets");
        }
        const data = await response.json();
        if (data.message === "Limit Exceeded") {
          setError("Live bracket could not be loaded");
          throw new Error(data.message);
        }
        setLiveBracket(data);
        setLoading(false);
        console.log("liveBracket data: ", data);
      } catch (err) {
        console.error("Error fetching brackets:", err);
        setError("Failed to load live bracket");
        setLoading(false);
      }
    }
    grab_live_bracket_info();
  }, []);

  return (
    <>
      {loading ? (
        error ? (
          <div className="border rounded-lg p-6 text-center">
            <p className="font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mb-4"></div>
            <p className="pl-2">Loading live bracket...</p>
          </div>
        )
      ) : (
        <div className="border border-white px-8">
          <Bracket bracket={liveBracket} liveBracket={true} />
        </div>
      )}
    </>
  );
}
