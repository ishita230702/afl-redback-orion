import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TeamMatchFilters from "@/components/dashboard/TeamMatchFilters";
import TeamMatchCompare from "@/components/dashboard/TeamMatchCompare";
import TeamCompareBar from "@/components/dashboard/TeamCompareBar";
import { Flag } from "lucide-react";

export type TeamMatch = any;

export type TeamTabProps = {
  teamMatches: TeamMatch[];
  teamSearch: string; setTeamSearch: (v: string) => void;
  teamFilter: string; setTeamFilter: (v: string) => void;
  teamRound: string; setTeamRound: (v: string) => void;
  teamA: string; setTeamA: (v: string) => void;
  teamB: string; setTeamB: (v: string) => void;
};

export default function TeamTab(props: TeamTabProps) {
  const { teamMatches, teamSearch, setTeamSearch, teamFilter, setTeamFilter, teamRound, setTeamRound, teamA, setTeamA, teamB, setTeamB } = props;

  const teamRounds = useMemo(() => ["all", ...Array.from(new Set(teamMatches.map((m: any) => m.round)))], [teamMatches]);
  const teamTeams = useMemo(() => {
    const s = new Set<string>(); teamMatches.forEach((m: any) => { s.add(m.teams.home); s.add(m.teams.away); });
    return ["all", ...Array.from(s).sort()];
  }, [teamMatches]);
  const teamFiltered = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    return teamMatches.filter((m: any) => {
      const matchesRound = teamRound === "all" || m.round === teamRound;
      const matchesTeam = teamFilter === "all" || m.teams.home === teamFilter || m.teams.away === teamFilter;
      const hay = `${m.teams.home} ${m.teams.away} ${m.venue}`.toLowerCase();
      return matchesRound && matchesTeam && (q === "" || hay.includes(q));
    });
  }, [teamMatches, teamRound, teamFilter, teamSearch]);
  const teamSummary = useMemo(() => teamFiltered.reduce((acc: any, m: any) => {
    acc.games += 1; acc.goals += m.stats.home.goals + m.stats.away.goals; acc.disposals += m.stats.home.disposals + m.stats.away.disposals; acc.inside50 += m.stats.home.inside50 + m.stats.away.inside50; return acc;
  }, { games: 0, goals: 0, disposals: 0, inside50: 0 }), [teamFiltered]);

  const calcTotals = (name: string) => {
    const base = { goals: 0, disposals: 0, marks: 0, tackles: 0, clearances: 0, inside50: 0, effSum: 0, effCount: 0 };
    if (!name || name === "all") return base;
    for (const m of teamMatches) {
      if (m.teams.home === name) { base.goals += m.stats.home.goals; base.disposals += m.stats.home.disposals; base.marks += m.stats.home.marks; base.tackles += m.stats.home.tackles; base.clearances += m.stats.home.clearances; base.inside50 += m.stats.home.inside50; base.effSum += m.stats.home.efficiency; base.effCount += 1; }
      if (m.teams.away === name) { base.goals += m.stats.away.goals; base.disposals += m.stats.away.disposals; base.marks += m.stats.away.marks; base.tackles += m.stats.away.tackles; base.clearances += m.stats.away.clearances; base.inside50 += m.stats.away.inside50; base.effSum += m.stats.away.efficiency; base.effCount += 1; }
    }
    return base;
  };
  const a = useMemo(()=> calcTotals(teamA), [teamA, teamMatches]);
  const b = useMemo(()=> calcTotals(teamB), [teamB, teamMatches]);
  const teamCompare = useMemo(()=> ({ a, b, aEff: a.effCount ? Math.round(a.effSum/a.effCount):0, bEff: b.effCount? Math.round(b.effSum/b.effCount):0 }), [a,b]);

  return (
    <div className="space-y-6">
      <TeamMatchFilters
        teamSearch={teamSearch} setTeamSearch={setTeamSearch}
        teamFilter={teamFilter} setTeamFilter={setTeamFilter}
        teamRound={teamRound} setTeamRound={setTeamRound}
        teamRounds={teamRounds} teamTeams={teamTeams}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Matches</div><div className="text-2xl font-semibold">{teamSummary.games}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Total Goals</div><div className="text-2xl font-semibold">{teamSummary.goals}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Total Disposals</div><div className="text-2xl font-semibold">{teamSummary.disposals.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Inside 50s</div><div className="text-2xl font-semibold">{teamSummary.inside50}</div></CardContent></Card>
      </div>

      <TeamMatchCompare teamA={teamA} setTeamA={setTeamA} teamB={teamB} setTeamB={setTeamB} teamTeams={teamTeams} teamCompare={teamCompare} />

      <div className="grid grid-cols-1 gap-4">
        {teamFiltered.map((m: any) => {
          const homePoints = m.stats.home.goals * 6 + m.stats.home.behinds;
          const awayPoints = m.stats.away.goals * 6 + m.stats.away.behinds;
          const winPct = Math.min(100, Math.max(0, Math.round((homePoints / (homePoints + awayPoints || 1)) * 100)));
          return (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><Flag className="w-4 h-4 text-purple-600" /><CardTitle className="text-base">{m.teams.home} vs {m.teams.away}</CardTitle></div>
                  <Badge variant="outline">{m.round}</Badge>
                </div>
                <CardDescription>{m.venue} • {new Date(m.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Score</div>
                    <div className="text-2xl font-semibold">{homePoints} - {awayPoints}</div>
                    <div className="text-xs text-gray-500">{m.stats.home.goals}.{m.stats.home.behinds} vs {m.stats.away.goals}.{m.stats.away.behinds}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Win Probability ({m.teams.home})</div>
                    <Progress value={winPct} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TeamCompareBar label="Disposals" aLabel={m.teams.home} aValue={m.stats.home.disposals} bLabel={m.teams.away} bValue={m.stats.away.disposals} />
                  <TeamCompareBar label="Marks" aLabel={m.teams.home} aValue={m.stats.home.marks} bLabel={m.teams.away} bValue={m.stats.away.marks} />
                  <TeamCompareBar label="Tackles" aLabel={m.teams.home} aValue={m.stats.home.tackles} bLabel={m.teams.away} bValue={m.stats.away.tackles} />
                  <TeamCompareBar label="Clearances" aLabel={m.teams.home} aValue={m.stats.home.clearances} bLabel={m.teams.away} bValue={m.stats.away.clearances} />
                  <TeamCompareBar label="Inside 50" aLabel={m.teams.home} aValue={m.stats.home.inside50} bLabel={m.teams.away} bValue={m.stats.away.inside50} />
                  <TeamCompareBar label="Efficiency %" aLabel={m.teams.home} aValue={m.stats.home.efficiency} bLabel={m.teams.away} bValue={m.stats.away.efficiency} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
