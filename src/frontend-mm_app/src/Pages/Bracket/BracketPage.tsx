import Bracket from "@/Pages/Bracket/components/bracket";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import {
  Bracket as BracketType,
  Seed,
} from "@/Pages/Bracket/components/bracketTypes";

const BACKEND_URL = "http://localhost:8000";

/**
 * Interface for saved bracket data
 * Extends the base BracketType with additional properties for saved brackets
 */
interface SavedBracket extends BracketType {
  type?: 'saved';
  bracket?: BracketType;
  selection: any;
  score?: Number;
}

/**
 * BracketPage Component
 * 
 * Main component for managing user brackets. Handles:
 * - Displaying existing brackets
 * - Creating new brackets
 * - Saving bracket selections
 * - Scoring brackets
 */
export default function BracketPage({
  initialBrackets = [],
}: {
  initialBrackets?: BracketType[];
}) {
  // State management
  const [brackets, setBrackets] = useState<(BracketType | SavedBracket)[]>(initialBrackets);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const bracketRefs = useRef<Record<number, any>>({});

  /**
   * Fetches user's saved brackets and their scores on component mount
   */
  useEffect(() => {
    async function fetchBrackets() {
      if (!token) {
        setError("Login required.");
        setLoading(false);
        return;
      }

      try {
        // Get list of user's bracket numbers
        const res = await fetch(`${BACKEND_URL}/get_user_bracket_numbers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { bracket_numbers } = await res.json();

        const fetchedBrackets = [];
        // Fetch each bracket and calculate its score
        for (const num of bracket_numbers) {
          const res = await fetch(`${BACKEND_URL}/get_user_bracket/${num}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data && data.bracket) {
            // Calculate bracket score
            const scoring_res = await fetch(`${BACKEND_URL}/score_bracket`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                user_bracket: data.bracket,
              }),
            });
            const scoring_data = await scoring_res.json();

            // Create bracket object with all necessary data
            const bracketWithId = {
              bracket: typeof data.bracket === "object" ? data.bracket : {},
              selection: typeof data.bracket === "object" ? data.selection : {},
              id: num,
              type: 'saved',
              score: scoring_data.score
            };
            fetchedBrackets.push(bracketWithId as SavedBracket);
          }
        }
        setBrackets(fetchedBrackets as any);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching brackets:", err);
        setError("Failed to load brackets");
        setLoading(false);
      }
    }
    fetchBrackets();
  }, [token]);

  /**
   * Converts region seeds into a structured bracket format
   * @param regionSeeds - Object containing seeds for each region
   * @returns Formatted bracket structure
   */
  const convertToRoundsFormat = (regionSeeds: Record<string, Seed[]>) => {
    const regionNames = ["EAST", "WEST", "SOUTH", "MIDWEST"];
    const roundTitles = ["First Round", "Second Round", "Sweet 16", "Elite 8"];
    const formatted: any = {};

    // Create structure for each region
    for (const region of regionNames) {
      formatted[region] = {
        rounds: roundTitles.map((title, idx) => ({
          title,
          seeds: idx === 0 ? regionSeeds[region] || [] : [],
        })),
      };
    }

    // Add Final Four structure
    formatted["FINAL_FOUR"] = {
      rounds: [
        { title: "Final Four", seeds: [] },
        { title: "National Championship", seeds: [] },
        { title: "Champion", seeds: [] },
      ],
    };

    return formatted;
  };

  /**
   * Creates a new bracket for the user
   */
  const createBracket = async () => {
    try {
      // Get bracket template
      const API = await fetch(`${BACKEND_URL}/generate_bracket_template`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Get next bracket number
      const bracket_number = await fetch(`${BACKEND_URL}/get_user_bracket_id`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!API.ok) throw new Error("Failed to get bracket");
      if (!bracket_number.ok) throw new Error("Failed to collect bracket id/number");

      const data = await API.json();
      const bracket_num_data = await bracket_number.json();

      // Add new bracket to state
      setBrackets((prev) => [
        ...prev,
        {
          id: bracket_num_data.next_bracket_number,
          title: data.title,
          regions: convertToRoundsFormat(data.regions),
        },
      ]);
      setLoading(false);
    } catch (err) {
      console.error("Error with creating bracket:", err);
      setError("Failed to generate bracket.");
    }
  };

  /**
   * Saves a user's bracket and updates its score
   * @param bracket_number - The number of the bracket to save
   */
  const saveBracket = async (bracket_number: number) => {
    const bracketRef = bracketRefs.current[bracket_number];
    const token = localStorage.getItem("token");

    if (!bracketRef) {
      alert("Please finish all 63 picks before saving!");
      return;
    }

    try {
      // Save bracket
      const saveResponse = await fetch(`${BACKEND_URL}/create_user_bracket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bracket_number,
          bracket_selection: bracketRef,
        }),
      });

      // Get updated bracket data
      const userBracketResponse = await fetch(
        `${BACKEND_URL}/get_user_bracket/${bracket_number}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const userBracketData = await userBracketResponse.json();
      if (!userBracketData.bracket) {
        throw new Error("User bracket was not saved properly");
      }

      // Calculate new score
      const scoring_res = await fetch(`${BACKEND_URL}/score_bracket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_bracket: userBracketData.bracket,
        }),
      });
      const scoring_data = await scoring_res.json();

      // Update bracket score in state
      setBrackets(prevBrackets => 
        prevBrackets.map(bracket => 
          bracket.id === bracket_number 
            ? { ...bracket, score: scoring_data.score }
            : bracket
        )
      );

    } catch (error) {
      console.error("Error saving bracket:", error);
      setError("Failed to save bracket.");
    }
    alert("bracket has been saved")
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Brackets</h1>

      {loading && <p>Loading brackets...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && brackets.length > 0 ? (
        <ul>
          {brackets.map((bracket, index) => (
            <li key={index} className="mb-2 border p-2 rounded">
              <div className="relative">
                <Bracket
                  ref={(el) => {
                    if (el) bracketRefs.current[bracket.id] = el;
                  }}
                  bracket={('type' in bracket) ? (bracket as SavedBracket).bracket as BracketType : bracket}
                  type={bracket.type}
                  initialSelection={('type' in bracket) ? (bracket as any).selection as Record<string, string> : undefined}
                />
                <div className="absolute bottom-2 right-2 flex flex-col items-center space-y-2">
                    {'score' in bracket && 
                        <h3 className="text-red-500 font-bold text-xl font-mono">{String(bracket.score)}</h3>
                    }
                    <Button
                      onClick={() => saveBracket(bracket.id)}
                      className="bg-[var(--primary-color)] font-bold hover:bg-blue-900"
                    >
                      SAVE BRACKET
                    </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading &&
        !error && <p>No brackets found.</p>
      )}

      {token && (
        <Button
          onClick={() => createBracket()}
          className="bg-[var(--primary-color)] font-bold hover:bg-blue-900 mt-4"
        >
          CREATE NEW BRACKET
        </Button>
      )}
    </div>
  );
}
