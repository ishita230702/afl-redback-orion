import React, { useState, memo } from "react";
import lionsLogo from "../assets/lions.jpeg";
import eaglesLogo from "../assets/WestCoastEagles.png";

/* ----------reusable UI ---------- */
function MiniBar({ home = 0, away = 0 }: { home?: number; away?: number }) {
  const total = Math.max(1, home + away);
  return (
    <div className="my-2 flex h-2 w-full overflow-hidden rounded bg-slate-800/60">
      <div
        className="bg-rose-600"
        style={{ width: `${(home / total) * 100}%` }}
      />
      <div
        className="ml-auto bg-amber-400"
        style={{ width: `${(away / total) * 100}%` }}
      />
    </div>
  );
}

function StatRow({
  title,
  home,
  away,
  leftAvg,
  leftTotal,
  rightAvg,
  rightTotal,
}: {
  title: string;
  home: number;
  away: number;
  leftAvg?: string;
  leftTotal?: string;
  rightAvg?: string;
  rightTotal?: string;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr_140px] items-center gap-3 border-b border-white/5 px-6 py-3 last:border-0">
      <div className="text-xs text-slate-400">
        {leftAvg && <div>{leftAvg}</div>}
        {leftTotal && <div>{leftTotal}</div>}
      </div>

      <div>
        <div className="mb-1 text-center text-sm font-semibold text-slate-200">
          {title}
        </div>
        <MiniBar home={home} away={away} />
        <div className="mt-1 flex items-center justify-between text-slate-100">
          <span className="text-lg font-extrabold">{home}</span>
          <span className="text-xs uppercase text-slate-400">Match</span>
          <span className="text-lg font-extrabold">{away}</span>
        </div>
      </div>

      <div className="text-right text-xs text-slate-400">
        {rightAvg && <div>{rightAvg}</div>}
        {rightTotal && <div>{rightTotal}</div>}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  homeLogo,
  awayLogo,
  homeName,
  awayName,
}: {
  title: string;
  homeLogo?: string;
  awayLogo?: string;
  homeName?: string;
  awayName?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between px-2">
      <img
        src={homeLogo || lionsLogo}
        alt={`${homeName ?? "Home"} logo`}
        className="h-6 w-6 object-contain"
      />
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      <img
        src={awayLogo || eaglesLogo}
        alt={`${awayName ?? "Away"} logo`}
        className="h-6 w-6 object-contain"
      />
    </div>
  );
}

/* ---------- Team Stats (Marks + Defence only) ---------- */
function TeamStatsSection({
  homeName,
  awayName,
  homeLogo,
  awayLogo,
}: {
  homeName: string;
  awayName: string;
  homeLogo?: string;
  awayLogo?: string;
}) {
  const header = { homeLogo, awayLogo, homeName, awayName };
  const TEAM = {
    marks: {
      home: 148,
      away: 67,
      leftAvg: "104.1",
      leftTotal: "2498",
      rightAvg: "76.9",
      rightTotal: "1769",
    },
    marksI50: {
      home: 13,
      away: 7,
      leftAvg: "11.8",
      leftTotal: "284",
      rightAvg: "9.8",
      rightTotal: "225",
    },
    contMarks: {
      home: 9,
      away: 9,
      leftAvg: "8",
      leftTotal: "192",
      rightAvg: "7.9",
      rightTotal: "182",
    },
    tackles: {
      home: 58,
      away: 57,
      leftAvg: "56.2",
      leftTotal: "1348",
      rightAvg: "57.4",
      rightTotal: "1320",
    },
    tacklesI50: {
      home: 19,
      away: 12,
      leftAvg: "11.7",
      leftTotal: "281",
      rightAvg: "9.9",
      rightTotal: "228",
    },
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Marks" {...header} />
      <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
        <StatRow title="Marks" {...TEAM.marks} />
        <StatRow title="Marks Inside 50" {...TEAM.marksI50} />
        <StatRow title="Contested Marks" {...TEAM.contMarks} />
      </div>

      <SectionHeader title="Defence" {...header} />
      <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
        <StatRow title="Tackles" {...TEAM.tackles} />
        <StatRow title="Tackles Inside 50" {...TEAM.tacklesI50} />
      </div>
    </div>
  );
}

/* ---------- Player table (first 2 rows only) ---------- */
const SAMPLE_PLAYERS = [
  {
    "#": 4,
    Player: "Callum Ah Chee",
    team: "Brisbane Lions",
    AF: 85,
    G: 3,
    B: 1,
    K: 13,
    H: 11,
    D: 24,
    M: 2,
    T: 8,
    HO: 2,
    CLR: 0,
    MG: 333,
    GA: 2,
    ToG: 76,
  },
  {
    "#": 12,
    Player: "Oscar Allen",
    team: "West Coast Eagles",
    AF: 36,
    G: 1,
    B: 1,
    K: 8,
    H: 7,
    D: 15,
    M: 1,
    T: 4,
    HO: 0,
    CLR: 0,
    MG: 173,
    GA: 0,
    ToG: 97,
  },
];

const TeamBadge = memo(function TeamBadge({
  logoUrl,
  name,
  align = "left",
}: {
  logoUrl?: string;
  name: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`flex items-center gap-3 ${align === "right" ? "justify-end" : ""}`}
    >
      <div className="h-12 w-12 overflow-hidden rounded-md bg-white/10 ring-1 ring-white/10">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="h-full w-full object-contain"
          />
        ) : (
          "🏉"
        )}
      </div>
      <div className="text-base font-semibold">{name}</div>
    </div>
  );
});

const PlayerStatsSection = memo(function PlayerStatsSection({
  players = [],
  homeTeamName,
  awayTeamName,
}: {
  players: any[];
  homeTeamName: string;
  awayTeamName: string;
}) {
  const [teamFilter, setTeamFilter] = useState<"both" | "home" | "away">(
    "both",
  );
  const [view, setView] = useState<"match" | "season">("match");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: "AF",
    dir: "desc",
  });

  const columns = [
    { key: "#", label: "#", numeric: true, width: 56 },
    {
      key: "Player",
      label: "Player",
      numeric: false,
      width: 240,
      sortable: true,
    },
    { key: "AF", label: "AF", numeric: true, sortable: true },
    { key: "G", label: "G", numeric: true, sortable: true },
    { key: "B", label: "B", numeric: true, sortable: true },
    { key: "K", label: "K", numeric: true, sortable: true },
    { key: "H", label: "H", numeric: true, sortable: true },
    { key: "D", label: "D", numeric: true, sortable: true },
    { key: "M", label: "M", numeric: true, sortable: true },
    { key: "T", label: "T", numeric: true, sortable: true },
    { key: "HO", label: "HO", numeric: true, sortable: true },
    { key: "CLR", label: "CLR", numeric: true, sortable: true },
    { key: "MG", label: "MG", numeric: true, sortable: true },
    { key: "GA", label: "GA", numeric: true, sortable: true },
    { key: "ToG", label: "ToG%", numeric: true, sortable: true },
  ] as const;

  const onSort = (key: string) => {
    // @ts-ignore
    if (!columns.find((c) => c.key === key)?.sortable) return;
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    );
  };

  const filtered = players.filter((p) => {
    if (teamFilter === "both") return true;
    const target = (teamFilter === "home" ? homeTeamName : awayTeamName) || "";
    return (p.team || "").toLowerCase().includes(target.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    const { key, dir } = sort;
    const aa =
      typeof a[key] === "number" ? a[key] : String(a[key]).toLowerCase();
    const bb =
      typeof b[key] === "number" ? b[key] : String(b[key]).toLowerCase();
    if (aa < bb) return dir === "asc" ? -1 : 1;
    if (aa > bb) return dir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      {/* toolbar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Stats</span>
            <button className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-100">
              Basic
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Teams</span>
            <select
              className="rounded-md border border-white/10 bg-slate-900/40 px-2 py-1 text-xs text-slate-100"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value as any)}
            >
              <option value="both">Both</option>
              <option value="home">{homeTeamName}</option>
              <option value="away">{awayTeamName}</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden rounded-md ring-1 ring-white/10">
          <button
            className={`px-3 py-1 text-xs font-semibold ${view === "match" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-200"}`}
            onClick={() => setView("match")}
          >
            Match
          </button>
          <button
            className={`px-3 py-1 text-xs font-semibold ${view === "season" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-200"}`}
            onClick={() => setView("season")}
          >
            Season avg.
          </button>
        </div>
      </div>

      {/* table */}
      <div>
        <table className="w-full table-fixed overflow-hidden rounded-lg border border-white/10">
          <thead className="bg-white/5">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key as string}
                  className={[
                    "px-2 py-2 text-left text-xs font-semibold text-slate-200",
                    // @ts-ignore
                    c.numeric ? "text-right" : "text-left",
                    // @ts-ignore
                    c.sortable ? "cursor-pointer select-none" : "",
                    sort.key === c.key ? "underline" : "",
                  ].join(" ")}
                  // @ts-ignore
                  style={c.width ? { width: c.width } : undefined}
                  onClick={() => onSort(c.key as string)}
                >
                  {/* @ts-ignore */ c.label}
                  {sort.key === c.key && (
                    <span className="ml-1 text-[10px]">
                      {sort.dir === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-900/40">
            {sorted.map((p, i) => (
              <tr
                key={`${p.team}-${p["#"]}-${p.Player}-${i}`}
                className="odd:bg-white/5 hover:bg-white/10"
              >
                <td className="px-2 py-2 text-right text-sm text-slate-200">
                  {p["#"]}
                </td>
                <td className="px-2 py-2">
                  <div className="text-sm font-medium text-slate-100">
                    {p.Player}
                  </div>
                </td>
                {[
                  "AF",
                  "G",
                  "B",
                  "K",
                  "H",
                  "D",
                  "M",
                  "T",
                  "HO",
                  "CLR",
                  "MG",
                  "GA",
                  "ToG",
                ].map((k) => (
                  <td key={k} className="px-2 py-2 text-right text-slate-200">
                    {p[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400 md:grid-cols-4">
          <span># Player Number</span>
          <span>AF: AFL Fantasy</span>
          <span>G: Goals</span>
          <span>B: Behinds</span>
          <span>K: Kicks</span>
          <span>H: Handball</span>
          <span>D: Disposals</span>
          <span>M: Marks</span>
          <span>T: Tackles</span>
          <span>CLR: Clearances</span>
          <span>MG: Metres Gained</span>
          <span>GA: Goal Assists</span>
          <span>ToG%: Time on Ground</span>
        </div>
      </div>
    </div>
  );
});

/* ---------- Page shell ---------- */
export default function MatchReport({ match }: { match?: any }) {
  const data = match || {
    statusLabel: "FULL TIME",
    venueText: "MCG, Melbourne • Wurundjeri",
    marginText: "Lions Won By 13",
    home: { name: "Brisbane", score: 82, behinds: "13.4", logoUrl: lionsLogo },
    away: {
      name: "West Coast",
      score: 69,
      behinds: "9.15",
      logoUrl: eaglesLogo,
    },
  };

  const [tab, setTab] = useState<"players" | "teams">("players");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-6">
        <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <TeamBadge
              align="left"
              logoUrl={data.home.logoUrl}
              name={data.home.name}
            />
            <div className="text-center">
              <div className="flex items-center justify-center gap-4">
                <div>
                  <div className="text-5xl font-extrabold">
                    {data.home.score}
                  </div>
                  <div className="text-xs text-slate-400">
                    {data.home.behinds}
                  </div>
                </div>
                <div className="rounded-lg bg-red-500 px-3 py-1 text-xs font-extrabold tracking-wide text-white">
                  {data.statusLabel}
                </div>
                <div>
                  <div className="text-5xl font-extrabold">
                    {data.away.score}
                  </div>
                  <div className="text-xs text-slate-400">
                    {data.away.behinds}
                  </div>
                </div>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {data.marginText}
              </div>
              <div className="text-xs text-slate-400">{data.venueText}</div>
            </div>
            <TeamBadge
              align="right"
              logoUrl={data.away.logoUrl}
              name={data.away.name}
            />
          </div>
        </div>
      </section>

      {/* TABS */}
      <nav className="mx-auto mt-2 flex max-w-6xl gap-2 px-4">
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "players" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-200"}`}
          onClick={() => setTab("players")}
        >
          Player Stats
        </button>
        <button
          className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "teams" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-200"}`}
          onClick={() => setTab("teams")}
        >
          Team Stats
        </button>
      </nav>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        {tab === "players" ? (
          <PlayerStatsSection
            players={SAMPLE_PLAYERS}
            homeTeamName={data.home.name}
            awayTeamName={data.away.name}
          />
        ) : (
          <TeamStatsSection
            homeName={data.home.name}
            awayName={data.away.name}
            homeLogo={data.home.logoUrl}
            awayLogo={data.away.logoUrl}
          />
        )}
      </section>
    </div>
  );
}
