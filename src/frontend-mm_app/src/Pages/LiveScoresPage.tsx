import ButtonBar from "@/components/ui/buttonbar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Game {
    away: {
        alias: string;
        points: number;
    };
    home: {
        alias: string;
        points: number;
    };
    away_points: number;
    home_points: number;
}

interface Round {
    name: string;
    bracketed?: {
        games: Game[];
    }[];
    games?: Game[];
}

interface BracketData {
    rounds: Round[];
}

export function LiveScoresPage() {
    const [marchMadnessData, setMarchMadnessData] = useState<BracketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRound, setSelectedRound] = useState("First Round");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchBracketData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${backendUrl}/get_bracket`, {
                method: "GET",
            });
            
            if (!response.ok) {
                throw new Error("Failed to get data");
            }
            
            const data = await response.json();
            setMarchMadnessData(data);
            changeScores("First Round", data);
        } catch (err) {
            setError("Failed to load scores. Please try again later.");
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBracketData();
    }, []);

    function changeScores(buttonName: string, data: BracketData) {
        setSelectedRound(buttonName);
        const title = document.getElementById("title");
        const container = document.getElementById("boxes");
        
        if (!title || !container) return;

        title.innerHTML = buttonName;
        title.className = "text-[22px] pb-6 pt-5";

        // Clear container
        container.innerHTML = '';

        function createNewElements(game: Game) {
            const newBox = document.createElement("div");
            newBox.className = "score-box";

            const away = document.createElement("div");
            const home = document.createElement("div");

            const name_away = document.createElement("p");
            const name_home = document.createElement("p");
            const score_away = document.createElement("p");
            const score_home = document.createElement("p");

            name_away.innerHTML = game.away.alias;
            name_home.innerHTML = game.home.alias;
            score_away.innerHTML = game.away_points.toString();
            score_home.innerHTML = game.home_points.toString();
            name_away.className = "mr-auto pl-2";
            name_home.className = "mr-auto pl-2";

            // Load team logos
            const images = import.meta.glob('../images/ncaa_logos/*.svg', { eager: true });
            for (const path in images) {
                const team_alias = path.split('/')[3].replace('.svg','');
                if (game.away.alias === team_alias) {
                    const img = document.createElement('img');
                    img.src = (images[path] as { default: string }).default;
                    img.width = 25;
                    away.appendChild(img);
                }

                if (game.home.alias === team_alias) {
                    const img = document.createElement('img');
                    img.src = (images[path] as { default: string }).default;
                    img.width = 25;
                    home.appendChild(img);
                }
            }

            away.appendChild(name_away);
            away.appendChild(score_away);
            home.appendChild(name_home);
            home.appendChild(score_home);

            // Style based on winner
            if (game.away_points < game.home_points) {
                home.className = "font-semibold text-[16px] flex pb-[10px] pt-[10px]";
                away.className = "text-zinc-400 text-[16px] flex pb-[10px]";
            } else {
                home.className = "text-zinc-400 text-[16px] flex pb-[10px] pt-[10px]";
                away.className = "font-semibold text-[16px] flex pb-[10px]";
            }

            newBox.appendChild(home);
            newBox.appendChild(away);

            const game_status = document.createElement("p");
            game_status.innerHTML = "FINAL";
            game_status.className = "font-semibold text-[14px] pb-[10px] text-center";
            newBox.appendChild(game_status);

            container.appendChild(newBox);
        }

        data.rounds.forEach((round, index) => {
            if (index !== 0 && round.name === buttonName) {
                if (index < 5) {
                    round.bracketed?.forEach(region => {
                        region.games.forEach(game => {
                            container.className = "columns-2";
                            createNewElements(game);
                        });
                    });
                } else {
                    round.games?.forEach(game => {
                        container.className = index === 6 ? "columns-1" : "columns-2";
                        createNewElements(game);
                    });
                }
            }
        });
    }

    const buttons = [
        { name: "First Round", date: "Mar 20 - 21" },
        { name: "Second Round", date: "Mar 22 - 23" },
        { name: "Sweet 16", date: "Mar 27 - 28" },
        { name: "Elite Eight", date: "Mar 29 - 30" },
        { name: "Final Four", date: "Apr 5" },
        { name: "National Championship", date: "Apr 7" }
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchBracketData}>Try Again</Button>
            </div>
        );
    }

    return (
        <div>
            <ButtonBar>
                {buttons.map((button) => (
                    <Button
                        key={button.name}
                        className={`live-scores-button ${selectedRound === button.name ? 'bg-blue-100' : ''}`}
                        onClick={() => marchMadnessData && changeScores(button.name, marchMadnessData)}
                    >
                        <div>
                            <p className="whitespace-pre-line">{button.name}</p>
                            <p className="text-xs text-neutral-400">{button.date}</p>
                        </div>
                    </Button>
                ))}
            </ButtonBar>
            
            <div className="scores-box-container">
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        <p id="title" className="text-[22px] pb-6 pt-5">{selectedRound}</p>
                        <div className="columns-2" id="boxes"></div>
                    </>
                )}
            </div>
        </div>
    );
}