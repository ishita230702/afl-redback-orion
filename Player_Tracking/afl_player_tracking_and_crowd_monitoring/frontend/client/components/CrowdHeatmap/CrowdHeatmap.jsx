// src/components/CrowdHeatmap.js
import React, { useEffect, useMemo, useState } from 'react';
import { CROWD_SCENARIOS } from './mockCrowdData';
import './CrowdHeatmap.css';

const stadiumImage = '/AFL_stadium.png';

// Green → Yellow → Red with alpha
const colorFor = (p) => {
  const clamped = Math.max(0, Math.min(1, p));
  const hue = 120 - 120 * clamped; // 120(green) → 0(red)
  return `hsla(${hue}, 90%, 50%, 0.85)`;
};

const CrowdHeatmap = () => {
  const [scenarioKey, setScenarioKey] = useState('typical');
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  // which zones are selected for comparison
  const [selectedZones, setSelectedZones] = useState([]);

  const handleZoneClick = (zoneName) => {
    setSelectedZones(prev =>
      prev.includes(zoneName)
        ? prev.filter(z => z !== zoneName)   // unselect
        : [...prev, zoneName]                // select
    );
  };

  const { frames, label } = useMemo(() => {
    const s = CROWD_SCENARIOS[scenarioKey];
    return { frames: s.frames, label: s.label };
  }, [scenarioKey]);

  const frame = frames[frameIdx];

  // Auto-advance when playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setFrameIdx((i) => (i + 1) % frames.length);
    }, 1400);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const prev = () => setFrameIdx((i) => (i - 1 + frames.length) % frames.length);
  const next = () => setFrameIdx((i) => (i + 1) % frames.length);

  // Save current frames into localStorage
  const saveReplay = () => {
    const toSave = { frames, label, savedAt: new Date().toISOString() };
    localStorage.setItem('crowdReplay', JSON.stringify(toSave));
    alert('Replay saved.');
  };

  // Load frames back from localStorage
  const loadReplay = () => {
    const raw = localStorage.getItem('crowdReplay');
    if (!raw) {
      alert('No saved replay found.');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setFrameIdx(0); // reset to start
      alert(`Loaded replay saved at ${parsed.savedAt}`);
    } catch {
      alert('Saved replay is corrupted.');
    }
  };
  return (
    <div className="heatmap-wrap">
      {/* Header / controls */}
      <div className="heatmap-header">
        {/*New Save/Replay controls */}
        <div className="replay-controls" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={saveReplay}>💾 Save Replay</button>
          <button onClick={loadReplay}>▶ Replay Saved</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="heatmap-canvas">
        <img src={stadiumImage} alt="AFL Stadium" className="stadium-image" />

        {/* Heat overlays */}
        {frame.zones.map((z, i) => (
          <div
            key={i}
            className="heat-blob clickable"
            style={{
              left: `${z.x * 100}%`,
              top: `${z.y * 100}%`,
              backgroundImage: `radial-gradient(circle, ${colorFor(z.intensity)} 0%, rgba(0,0,0,0) 70%)`,
            }}
            onClick={() => handleZoneClick(z.zone)}
            aria-label={`${z.zone} crowd intensity ${Math.round(z.intensity * 100)}%`}
          />
        ))}


        {/* Labels */}
        {frame.zones.map((z, i) => (
          <div
            key={`label-${i}`}
            className="heat-label"
            style={{ left: `${z.x * 100}%`, top: `calc(${z.y * 100}% - 8px)` }}
          >
            {z.zone}
          </div>
        ))}
      </div>

      {/* Timeline slider + last updated */}
      <div className="heatmap-footer">
        <input
          className="heatmap-range"
          type="range"
          min={0}
          max={frames.length - 1}
          value={frameIdx}
          onChange={(e) => setFrameIdx(parseInt(e.target.value, 10))}
        />
        <div className="heatmap-updated">
          <strong>Last updated:</strong> {frame.ts}
        </div>
      </div>

      {/*Zone history / comparison panel */}
      {selectedZones.length > 0 && (
        <div className="zone-history-panel">
          <h3 style={{ margin: '0 0 8px' }}>Zone Comparison</h3>
          {selectedZones.map(zone => (
            <div key={zone} className="zone-history">
              <h4>{zone}</h4>
              <ul style={{ margin: 0, paddingLeft: '18px' }}>
                {frames.map((f, idx) => {
                  const z = f.zones.find(k => k.zone === zone);
                  return (
                    <li key={idx}>
                      {f.ts} — {Math.round((z?.intensity ?? 0) * 100)}%
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}


      {/* Legend */}
      <div className="heatmap-legend">
        <span className="legend-swatch" style={{ background: colorFor(0.2) }} />
        <small>Low</small>
        <span className="legend-swatch" style={{ background: colorFor(0.5) }} />
        <small>Medium</small>
        <span className="legend-swatch" style={{ background: colorFor(0.85) }} />
        <small>High</small>
        <div className="legend-right">{label}</div>
      </div>
    </div>
  );
};

export default CrowdHeatmap;
