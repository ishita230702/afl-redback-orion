// src/components/mockCrowdData.js

// Each scenario has a short sequence of frames (timestamps + zone intensities 0..1).
// x,y are % of the stadium image (0..1). 
const ZONES = [
  { zone: 'Zone 1', x: 0.26, y: 0.26 },
  { zone: 'Zone 2', x: 0.50, y: 0.15 },
  { zone: 'Zone 3', x: 0.72, y: 0.25 },
  { zone: 'Zone 4', x: 0.79, y: 0.50 },
  { zone: 'Zone 5', x: 0.72, y: 0.75 },
  { zone: 'Zone 6', x: 0.50, y: 0.86 },
  { zone: 'Zone 7', x: 0.28, y: 0.73 },
  { zone: 'Zone 8', x: 0.20, y: 0.50 },
];

// Helper to build a frame quickly by listing intensities in zone order
const frame = (ts, intensities) =>
  ({
    ts, // ISO or any readable string; shown in “Last updated”
    zones: ZONES.map((z, i) => ({ ...z, intensity: intensities[i] }))
  });

export const CROWD_SCENARIOS = {
  low: {
    label: 'Low crowd density',
    frames: [
      frame('2025-08-21 19:30:00', [0.10,0.15,0.18,0.12,0.14,0.16,0.12,0.10]),
      frame('2025-08-21 19:32:00', [0.12,0.18,0.20,0.14,0.16,0.18,0.14,0.12]),
      frame('2025-08-21 19:34:00', [0.15,0.20,0.22,0.15,0.18,0.20,0.16,0.14]),
    ],
  },
  typical: {
    label: 'Typical crowd density',
    frames: [
      frame('2025-08-21 19:30:00', [0.25,0.45,0.55,0.30,0.40,0.45,0.35,0.60]),
      frame('2025-08-21 19:32:00', [0.28,0.50,0.60,0.35,0.42,0.50,0.38,0.70]),
      frame('2025-08-21 19:34:00', [0.30,0.55,0.62,0.40,0.46,0.52,0.40,0.75]),
    ],
  },
  high: {
    label: 'High crowd density',
    frames: [
      frame('2025-08-21 19:30:00', [0.55,0.70,0.78,0.50,0.65,0.72,0.60,0.90]),
      frame('2025-08-21 19:32:00', [0.60,0.75,0.82,0.58,0.70,0.78,0.66,0.92]),
      frame('2025-08-21 19:34:00', [0.65,0.80,0.88,0.62,0.74,0.82,0.70,0.95]),
    ],
  },
};
