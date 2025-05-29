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

const ScoreBox = ({ game }: { game: Game }) => {
    const [awayLogo, setAwayLogo] = useState<string>('');
    const [homeLogo, setHomeLogo] = useState<string>('');

    useEffect(() => {
        const images = import.meta.glob('../images/ncaa_logos/*.svg', { eager: true });
        for (const path in images) {
            const team_alias = path.split('/')[3].replace('.svg', '');
            if (game.away.alias === team_alias) {
                setAwayLogo((images[path] as { default: string }).default);
            }
            if (game.home.alias === team_alias) {
                setHomeLogo((images[path] as { default: string }).default);
            }
        }
    }, [game]);

    return (
        <div className="score-box">
            <div className={`flex pb-[10px] pt-[10px] ${game.home_points > game.away_points ? 'font-semibold text-[16px]' : 'text-zinc-400 text-[16px]'}`}>
                {homeLogo && <img src={homeLogo} width={25} alt={game.home.alias} />}
                <p className="mr-auto pl-2">{game.home.alias}</p>
                <p>{game.home_points}</p>
            </div>
            <div className={`flex pb-[10px] ${game.away_points > game.home_points ? 'font-semibold text-[16px]' : 'text-zinc-400 text-[16px]'}`}>
                {awayLogo && <img src={awayLogo} width={25} alt={game.away.alias} />}
                <p className="mr-auto pl-2">{game.away.alias}</p>
                <p>{game.away_points}</p>
            </div>
            <p className="font-semibold text-[14px] pb-[10px] text-center">FINAL</p>
        </div>
    );
};

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

    const handleRoundChange = (roundName: string) => {
        setSelectedRound(roundName);
    };

    const getCurrentRoundGames = () => {
        if (!marchMadnessData) return [];
        
        // Find the round that matches the selected round name
        const roundIndex = marchMadnessData.rounds.findIndex((r, index) => index !== 0 && r.name === selectedRound);
        if (roundIndex === -1) return [];

        const round = marchMadnessData.rounds[roundIndex];
        
        // Handle Final Four and National Championship rounds (index 5 and 6)
        if (roundIndex >= 5) {
            return round.games || [];
        }
        
        // Handle earlier rounds (First Round through Elite Eight)
        if (round.bracketed) {
            return round.bracketed.flatMap(region => region.games);
        }
        
        return [];
    };

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

    const currentGames = getCurrentRoundGames();
    const isChampionship = selectedRound === "National Championship";

    return (
        <div>
            <ButtonBar>
                {buttons.map((button) => (
                    <Button
                        key={button.name}
                        className={`live-scores-button ${selectedRound === button.name ? 'bg-blue-100' : ''}`}
                        onClick={() => handleRoundChange(button.name)}
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
                        <p className="text-[22px] pb-6 pt-5">{selectedRound}</p>
                        <div className={`grid ${isChampionship ? 'grid-cols-1' : 'grid-cols-2'} gap-x-4 gap-y-2`}>
                            {currentGames.map((game, index) => (
                                <ScoreBox key={`${game.home.alias}-${game.away.alias}-${index}`} game={game} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}