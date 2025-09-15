import React, { memo } from "react";
// (no css import needed)
import lionsLogo from "../assets/lions.jpeg";
import eaglesLogo from "../assets/WestCoastEagles.png";

const MatchSummaryCard = memo(function MatchSummaryCard({
  match,
  onOpenReport,
}: {
  match: any;
  onOpenReport?: () => void;
}) {
  const {
    dateLabel,
    statusLabel,
    home,
    away,
    marginText,
    venueText,
    highlightsUrl: _highlightsUrl,
  } = match;

  return (
    <div
      className={
        // original + tailwind
        "ta-card mx-auto w-full max-w-[1080px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md"
      }
    >
      <div className="ta-date px-5 pt-3 text-sm font-semibold text-slate-500">
        {dateLabel}
      </div>

      <div
        className={
          "ta-summary relative flex items-center justify-center gap-6 border-t-4 border-red-500 px-5 py-4"
        }
      >
        <div
          className={`ta-status ta-status--${statusLabel
            .replace(" ", "")
            .toLowerCase()} absolute left-1/2 top-[-14px] -translate-x-1/2 rounded-lg bg-red-500 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white`}
        >
          {statusLabel}
        </div>

        <div className="ta-center mx-auto flex items-center gap-6">
          {/* home side */}
          <div className="ta-side ta-side--home flex items-center gap-2">
            <div className="ta-team-name text-base font-bold text-slate-900">
              {home.name}
            </div>
            <div
              className="ta-team-logo ml-1 flex h-24 items-center"
              aria-hidden
            >
              <img
                src={home.logoUrl}
                alt={`${home.name} logo`}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          {/* score cluster */}
          <div className="ta-score-block flex items-center gap-3">
            <div className="ta-score leading-none text-5xl font-extrabold text-slate-900">
              {home.score}
            </div>
            <div className="ta-afl-dot grid h-10 w-10 place-items-center rounded-full bg-blue-700 text-[11px] font-extrabold tracking-wide text-white">
              AFL
            </div>
            <div className="ta-score leading-none text-5xl font-extrabold text-slate-900">
              {away.score}
            </div>
          </div>

          {/* away side */}
          <div className="ta-side ta-side--away flex items-center gap-2">
            <div
              className="ta-team-logo mr-1 flex h-24 items-center"
              aria-hidden
            >
              <img
                src={away.logoUrl}
                alt={`${away.name} logo`}
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="ta-team-name text-base font-bold text-slate-900">
              {away.name}
            </div>
          </div>
        </div>

        <a
          className="ta-report-btn absolute right-5 top-1/2 -translate-y-1/2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-900 hover:bg-indigo-100"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (typeof onOpenReport === "function") onOpenReport();
          }}
        >
          📰 Match Report
        </a>
      </div>

      <div className="ta-footer flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t px-5 py-3 text-center text-sm font-medium">
        <div className="ta-margin text-slate-900">{marginText}</div>
        <div className="ta-venue text-slate-500">{venueText}</div>
      </div>
    </div>
  );
});

export default function TeamsAnalytics({
  match,
  onOpenReport,
}: {
  match?: any;
  onOpenReport?: () => void;
}) {
  const sampleMatch = match || {
    dateLabel: "Thursday March 13",
    statusLabel: "FULL TIME",
    home: { name: "Brisbane Lions", score: 82, logoUrl: lionsLogo },
    away: { name: "West Coast Eagles", score: 69, logoUrl: eaglesLogo },
    marginText: "Brisbane won by 13",
    venueText: "MCG, Melbourne • Wurundjeri",
  };

  return (
    <div className="teams-analytics min-h-[calc(100vh-120px)] bg-slate-50 p-6">
      <h1 className="ta-title mb-4 text-2xl font-extrabold text-black">
        Teams Analytics
      </h1>
      <MatchSummaryCard match={sampleMatch} onOpenReport={onOpenReport} />
    </div>
  );
}
