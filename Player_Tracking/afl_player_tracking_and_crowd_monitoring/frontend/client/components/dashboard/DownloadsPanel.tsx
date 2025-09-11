import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, BarChart3, Target, Users } from "lucide-react";

export type PlayerOption = {
  id: number;
  name: string;
  team: string;
  position: string;
  kicks: number;
  handballs: number;
  marks: number;
  tackles: number;
  goals: number;
  efficiency: number;
};

export type DownloadsPanelProps = {
  players: PlayerOption[];
  teams: string[];
  crowdZonesCount: number;
  totalAttendance: number;
  onDownloadPlayer: (args: { mode: "individual" | "comparison"; primary: PlayerOption; comparison?: PlayerOption }) => void;
  onDownloadTeam: (args: { mode: "individual" | "comparison"; teamA?: string; teamB?: string; includeMatches: boolean }) => void;
  onDownloadCrowd: (args: { includeTimeline: boolean }) => void;
  defaults?: { primaryPlayerName?: string; comparisonPlayerName?: string; teamA?: string; teamB?: string };
};

export default function DownloadsPanel(props: DownloadsPanelProps) {
  const { players, teams, crowdZonesCount, totalAttendance, onDownloadPlayer, onDownloadTeam, onDownloadCrowd, defaults } = props;

  const [playerMode, setPlayerMode] = useState<"individual" | "comparison">("individual");
  const [primaryName, setPrimaryName] = useState(defaults?.primaryPlayerName || players[0]?.name || "");
  const [comparisonName, setComparisonName] = useState(defaults?.comparisonPlayerName || players[1]?.name || "");

  const [teamMode, setTeamMode] = useState<"individual" | "comparison">("comparison");
  const [teamA, setTeamA] = useState(defaults?.teamA || teams[0] || "");
  const [teamB, setTeamB] = useState(defaults?.teamB || teams[1] || "");
  const [includeMatches, setIncludeMatches] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);

  const primary = useMemo(() => players.find(p => p.name === primaryName) || players[0], [players, primaryName]);
  const comparison = useMemo(() => players.find(p => p.name === comparisonName) || players[1] || players[0], [players, comparisonName]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Player Performance PDF
          </CardTitle>
          <CardDescription>Export individual player, or compare two players</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="player-mode" checked={playerMode==='individual'} onChange={()=>setPlayerMode('individual')} />
              Individual
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="player-mode" checked={playerMode==='comparison'} onChange={()=>setPlayerMode('comparison')} />
              Comparison
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Primary Player</label>
              <Select value={primaryName} onValueChange={setPrimaryName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p)=> (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {playerMode==='comparison' && (
              <div>
                <label className="text-sm font-medium">Comparison Player</label>
                <Select value={comparisonName} onValueChange={setComparisonName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((p)=> (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button className="w-full" onClick={() => onDownloadPlayer({ mode: playerMode, primary, comparison: playerMode==='comparison' ? comparison : undefined })}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Team Performance PDF
          </CardTitle>
          <CardDescription>Export individual team, or compare two teams</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="team-mode" checked={teamMode==='individual'} onChange={()=>setTeamMode('individual')} />
              Individual
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="team-mode" checked={teamMode==='comparison'} onChange={()=>setTeamMode('comparison')} />
              Comparison
            </label>
          </div>

          {teamMode==='individual' ? (
            <div>
              <label className="text-sm font-medium">Team</label>
              <Select value={teamA} onValueChange={setTeamA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t)=> (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Team A</label>
                <Select value={teamA} onValueChange={setTeamA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t)=> (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Team B</label>
                <Select value={teamB} onValueChange={setTeamB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t)=> (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" checked={includeMatches} onChange={(e)=>setIncludeMatches(e.target.checked)} />
            Include matches list
          </label>

          <Button className="w-full" onClick={() => onDownloadTeam({ mode: teamMode, teamA, teamB, includeMatches })}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Crowd Monitor PDF
          </CardTitle>
          <CardDescription>
            {crowdZonesCount} sections • Total attendance: {totalAttendance.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" checked={includeTimeline} onChange={(e)=>setIncludeTimeline(e.target.checked)} />
            Include timeline chart
          </label>
          <Button className="w-full" onClick={() => onDownloadCrowd({ includeTimeline })}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
