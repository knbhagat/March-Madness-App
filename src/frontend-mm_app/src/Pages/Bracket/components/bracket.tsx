import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  Children,
} from "react";
import {
  Bracket as BracketType,
  Region,
  Round,
  Seed as SeedType,
} from "@/Pages/Bracket/components/bracketTypes";
import {
  Bracket as ReactBracket,
  RoundProps,
  Seed,
  SeedItem,
  SeedTeam,
} from "react-brackets";
import { C } from "vitest/dist/chunks/reporters.d.CfRkRKN2.js";

/**
 * Props interface for the Bracket component
 */
interface BracketProps {
  bracket: BracketType; // The bracket data to display
  type?: string; // Type of bracket ('live' or user bracket)
  onChange?: (selected: Record<string, string>) => void; // Callback for team selection changes
  initialSelection?: Record<string, string>; // Initial team selections for saved brackets
}

/**
 * Props interface for the CustomSeed component
 */
interface CustomSeedProps {
  seed: SeedType;
  breakpoint: number;
  seedIndex: number;
  roundIndex: number;
  region: Region;
  selection: Record<string, string>;
  setSelection: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  type: String;
  bracketId?: number;
}

/**
 * CustomSeed Component
 * Renders individual matchups in the bracket with team selection functionality
 */
const CustomSeed = ({
  seed,
  breakpoint,
  seedIndex,
  region,
  roundIndex,
  selection,
  setSelection,
  type,
  bracketId,
}: CustomSeedProps) => {
  // Render live bracket view
  if (type === 'live') {
    return (
      <Seed mobileBreakpoint={breakpoint}>
        <SeedItem>
          <SeedTeam>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
              className={
                seed.homeScore > seed.awayScore
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              <span>{`${seed.teams[0]?.seed ?? ""}  ${
                seed.teams[0]?.name ?? ""
              }`}</span>
              <span>{seed.homeScore ?? ""}</span>
            </div>
          </SeedTeam>
          <SeedTeam>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
              className={
                seed.homeScore < seed.awayScore
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              <span>{`${seed.teams[1]?.seed ?? ""}  ${
                seed.teams[1]?.name ?? ""
              }`}</span>
              <span>{seed.awayScore ?? ""}</span>
            </div>
          </SeedTeam>
        </SeedItem>
        <p className="text-xs mt-1">{seed.location}</p>
      </Seed>
    );
  } else {
    // User bracket view with team selection
    const key = `${roundIndex}-${seedIndex}-${region}`;

    const team1 = seed.teams[0]?.name;
    const team1seed = seed.teams[0]?.seed;

    const team2 = seed.teams[1]?.name;
    const team2seed = seed.teams[1]?.seed;

    const value1 = `${team1seed}_${team1}-${seed.id}-0`;
    const value2 = `${team2seed}_${team2}-${seed.id}-1`;

    // Create unique radio input names by including bracketId
    const radioName = `team-select-${bracketId}-${key}`;

    /**
     * Updates the selection state when a team is chosen
     * Handles the logic for propagating selections through the bracket
     */
    function updateSelection(teamSeedPlace: string) {
      const [, selectedTeamName] = teamSeedPlace.split("-")[0].split("_");

      setSelection((prev) => {
        // Parse the current round and region from the key
        const [roundNum, , region] = key.split("-");
        const currentRound = parseInt(roundNum);

        const removedTeam = prev[key]?.split("-")[0].split("_")[1];
        // Build the updated bracket
        const updateBracket = {} as Record<string, string>;

        // Process all previous selections
        for (const [k, v] of Object.entries(prev)) {
          const [reigonNum, , reigonReg] = k.split("-");
          const round = parseInt(reigonNum);

          // Determine if this selection should be kept
          const isSameRegion = reigonReg === region;
          const isLaterRound = round > currentRound;
          const hasRemovedTeam = removedTeam && v.includes(removedTeam);

          // Keep pick if it doesn't involve the removed team
          if (!isSameRegion || !isLaterRound || !hasRemovedTeam) {
            updateBracket[k] = v;
          }
        }

        updateBracket[key] = teamSeedPlace;

        // Remove removedTeam from Final Four + Championship
        if (
          ["EAST", "WEST", "SOUTH", "MIDWEST"].includes(region) &&
          removedTeam
        ) {
          for (const k of Object.keys(updateBracket)) {
            if (
              (k.includes("FINAL FOUR") || k.includes("CHAMPIONSHIP")) &&
              updateBracket[k].includes(removedTeam)
            ) {
              delete updateBracket[k];
            }
          }
        }

        return updateBracket;
      });
    }

    return (
      <Seed mobileBreakpoint={breakpoint}>
        <SeedItem>
          <div className="text-left">
            <SeedTeam
              className={
                selection[key] === value1
                  ? "text-green-500"
                  : selection[key] === value2
                  ? "text-red-500"
                  : "text-blue-200"
              }
            >
              {`${seed.teams[0]?.seed ?? ""}  ${
                seed.teams[0]?.name ?? "NO TEAM "
              }`}
              <input
                disabled={[
                  "TBD",
                  "Midwest Champ",
                  "East Champ",
                  "South Champ",
                  "West Champ",
                ].includes(team1)}
                type="radio"
                name={radioName}
                value={value1}
                checked={selection[key] === value1}
                onChange={() => updateSelection(value1)}
              />
            </SeedTeam>
            <SeedTeam
              className={
                selection[key] === value2
                  ? "text-green-500"
                  : selection[key] === value1
                  ? "text-red-500"
                  : "text-blue-200"
              }
            >
              {`${seed.teams[1]?.seed ?? ""}  ${
                seed.teams[1]?.name ?? "NO TEAM "
              }`}
              <input
                disabled={[
                  "TBD",
                  "Midwest Champ",
                  "East Champ",
                  "South Champ",
                  "West Champ",
                ].includes(team2)}
                type="radio"
                name={radioName}
                value={value2}
                checked={selection[key] === value2}
                onChange={() => updateSelection(value2)}
              />
            </SeedTeam>
          </div>
        </SeedItem>
      </Seed>
    );
  }
};

/**
 * Bracket Component
 * Main component for rendering the tournament bracket
 * Handles both live and user bracket views
 */
const Bracket = forwardRef(function Bracket(
  { bracket, type, onChange, initialSelection }: BracketProps,
  ref
) {
  // State management
  const [selectedRegion, setSelectedRegion] = useState<Region>("EAST");
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string>>({});
  const [rounds, setRounds] = useState<Round[]>([]);
  const [finalFourRounds, setFinalFourRounds] = useState<Round[]>([
    {
      title: "Final Four",
      seeds: [
        {
          id: 1,
          date: new Date().toDateString(),
          teams: [{ name: "East Champ" }, { name: "Midwest Champ" }],
        },
        {
          id: 2,
          date: new Date().toDateString(),
          teams: [{ name: "South Champ" }, { name: "West Champ" }],
        },
      ],
    },
    {
      title: "Championship",
      seeds: [
        {
          id: 1,
          date: new Date().toDateString(),
          teams: [{ name: "TBD" }, { name: "TBD" }],
        },
      ],
    },
  ]);

  // Notify parent component of selection changes
  useEffect(() => {
    if (onChange) onChange(selectedTeams);
  }, [selectedTeams]);

  // Initialize selections from saved bracket
  useEffect(() => {
    if (initialSelection && Object.keys(initialSelection).length > 0) {
      setSelectedTeams(initialSelection);
    }
  }, [initialSelection]);

  /**
   * Updates the bracket rounds based on selected teams
   * Handles the logic for advancing teams through the bracket
   */
  useEffect(() => {
    // Validate bracket data
    if (!bracket?.regions?.[selectedRegion]) return;
    if (!bracket.regions[selectedRegion].rounds?.[0]) return;
    if (selectedRegion === "FINAL FOUR") return;

    // Get base seeds for round of 64
    const baseSeeds = bracket.regions[selectedRegion].rounds[0].seeds;

    const newRounds: Round[] = [
      {
        title: "Round of 64",
        seeds: baseSeeds,
      },
    ];

    // Create subsequent rounds based on selections
    for (let i = 1; i < 4; i++) {
      const prevSeeds = newRounds[i - 1].seeds;
      const nextSeeds: SeedType[] = [];

      for (let j = 0; j < prevSeeds.length; j += 2) {
        const team1Key = `${i - 1}-${j}-${selectedRegion}`;
        const team2Key = `${i - 1}-${j + 1}-${selectedRegion}`;

        const [team1Seed, team1] = selectedTeams[team1Key]
          ?.split("-")[0]
          .split("_") || [undefined, "TBD"];
        const [team2Seed, team2] = selectedTeams[team2Key]
          ?.split("-")[0]
          .split("_") || [undefined, "TBD"];

        nextSeeds.push({
          id: j / 2 + 1,
          teams: [
            { name: team1, seed: team1Seed },
            { name: team2, seed: team2Seed },
          ],
        });
      }

      // Add round to bracket
      newRounds.push({
        title: i === 1 ? "Round of 32" : i === 2 ? "Sweet 16" : "Elite 8",
        seeds: nextSeeds,
      });
    }

    setRounds(newRounds);
  }, [bracket, selectedTeams, selectedRegion]);

  /**
   * Updates the Final Four and Championship rounds based on region winners
   */
  useEffect(() => {
    const regionOrder = ["EAST", "WEST", "SOUTH", "MIDWEST"];
    const updatedFinalFour = [...finalFourRounds];

    const regionWinners: Record<string, string> = {
      EAST: "East Champ",
      WEST: "West Champ",
      SOUTH: "South Champ",
      MIDWEST: "Midwest Champ",
    };

    // Get each region's champion
    for (const region of regionOrder) {
      const winnerKey = `3-0-${region}`;
      const selected = selectedTeams[winnerKey];
      if (selected) {
        const [teamSeed, teamName] = selected.split("-")[0].split("_");
        regionWinners[region] = teamName + "_" + teamSeed;
      }
    }

    // Set Final Four matchups
    updatedFinalFour[0].seeds[0].teams = [
      {
        name: regionWinners["EAST"].split("_")[0],
        seed: regionWinners["EAST"].split("_")[1] || undefined,
      },
      {
        name: regionWinners["MIDWEST"].split("_")[0],
        seed: regionWinners["MIDWEST"].split("_")[1] || undefined,
      },
    ];
    updatedFinalFour[0].seeds[1].teams = [
      {
        name: regionWinners["SOUTH"].split("_")[0],
        seed: regionWinners["SOUTH"].split("_")[1] || undefined,
      },
      {
        name: regionWinners["WEST"].split("_")[0],
        seed: regionWinners["WEST"].split("_")[1] || undefined,
      },
    ];

    // Get semifinal winners for Championship
    const semi1Key = `0-0-FINAL FOUR`;
    const semi2Key = `0-1-FINAL FOUR`;

    const [semi1Seed, semi1Winner] = selectedTeams[semi1Key]
      ?.split("-")[0]
      .split("_") || [undefined, "TBD"];
    const [semi2Seed, semi2Winner] = selectedTeams[semi2Key]
      ?.split("-")[0]
      .split("_") || [undefined, "TBD"];

    updatedFinalFour[1].seeds[0].teams = [
      { name: semi1Winner, seed: semi1Seed },
      { name: semi2Winner, seed: semi2Seed },
    ];

    setFinalFourRounds(updatedFinalFour);
  }, [selectedTeams]);

  /**
   * Creates the appropriate bracket view based on type
   */
  function createBracket() {
    return (
      <>
        {type !== 'live' ? (
          <ReactBracket
            bracketClassName={""}
            rounds={selectedRegion === "FINAL FOUR" ? finalFourRounds : rounds}
            renderSeedComponent={(props) => (
              <CustomSeed
                {...props}
                region={selectedRegion}
                selection={selectedTeams}
                setSelection={setSelectedTeams}
                type={type}
                bracketId={bracket.id}
              />
            )}
          />
        ) : (
          <ReactBracket 
            rounds={bracket.rounds} 
            renderSeedComponent={(props) => (
              <CustomSeed
                {...props}
                region={selectedRegion}
                selection={selectedTeams}
                setSelection={setSelectedTeams}
                type={type}
                bracketId={bracket.id}
              />
            )}
          />
        )}
      </>
    );
  }

  // Expose selected teams to parent component
  useImperativeHandle(ref, () => Object.keys(selectedTeams).length !== 63 ? undefined : selectedTeams);

  return (
    <div>
      <p className="text-center py-8 text-2xl font-bold"> {bracket.title} </p>
      {createBracket()}
      {type !== 'live' && (
        <div className="flex gap-5">
          {(["EAST", "WEST", "SOUTH", "MIDWEST", "FINAL FOUR"] as Region[]).map(
            (region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`font-bold ${
                  selectedRegion === region ? "text-white" : "text-gray-500"
                }`}
              >
                {region}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
});

export default Bracket;

