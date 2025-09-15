import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const labels = ["Match 1", "Match 2", "Match 3", "Match 4", "Match 5"];

const metricData = {
  "Fatigue Score": [67, 72, 63, 70, 69],
  "Time On Ground": [82, 79, 85, 80, 84],
  "Distance Covered": [10.8, 11.2, 9.5, 10.1, 10.9],
};

const possessionData = [55, 34, 40, 37, 68];
const barColors: Record<string, string> = {
  "Fatigue Score": "#dc2626",
  "Time On Ground": "#2563eb",
  "Distance Covered": "#16a34a",
};

const possessionSeries = labels.map((label, i) => ({ label, value: possessionData[i] }));

export function PossessionChart() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={possessionSeries} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" name="Possession (%)" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MetricsChart() {
  const [selectedMetric, setSelectedMetric] = useState<string>("Fatigue Score");
  const data = labels.map((label, i) => ({ label, value: metricData[selectedMetric][i] }));

  return (
    <div>
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        {Object.keys(metricData).map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-3 py-1 border rounded ${
              selectedMetric === metric ? "bg-red-600 text-white" : "bg-white text-gray-800"
            }`}
          >
            {metric}
          </button>
        ))}
      </div>
      <div className="w-full h-64">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name={selectedMetric} fill={barColors[selectedMetric]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


