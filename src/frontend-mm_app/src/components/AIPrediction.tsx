import React, { useState, useEffect } from 'react';

interface TeamPrediction {
  teamName: string;
  winPercentage: number;
}

export default function AIPrediction() {
  const [predictions, setPredictions] = useState<TeamPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPieChart, setIsPieChart] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/predictions`);
        if (!response.ok) {
          throw new Error('Failed to fetch predictions');
        }
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading predictions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  const renderBarChart = () => (
    <div className="divide-y divide-zinc-800 bg-[var(--live-scores-button-color)]">
      {predictions.map((team, index) => (
        <div 
          key={index} 
          className="p-6 hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {team.teamName}
                </h3>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-48 bg-zinc-700 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${team.winPercentage}%` }}
                />
              </div>
              <div className="w-20 text-right">
                <span className="text-lg font-semibold text-white">
                  {team.winPercentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    let currentAngle = 0;
    const colors = [
      '#3B82F6', // blue-500
      '#60A5FA', // blue-400
      '#93C5FD', // blue-300
      '#BFDBFE', // blue-200
      '#DBEAFE', // blue-100
      '#EFF6FF', // blue-50
      '#1E40AF', // blue-800
      '#1E3A8A', // blue-900
      '#2563EB', // blue-600
      '#1D4ED8', // blue-700
    ];

    return (
      <div className="p-6">
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {predictions.map((team, index) => {
              const angle = (team.winPercentage / 100) * 360;
              const startAngle = currentAngle;
              currentAngle += angle;
              
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 50 * Math.cos((currentAngle * Math.PI) / 180);
              const y2 = 50 + 50 * Math.sin((currentAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-300 hover:opacity-80"
                />
              );
            })}
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {predictions.map((team, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-white">{team.teamName}</span>
              <span className="text-white ml-auto">{team.winPercentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            AI March Madness Predictions
          </h1>
          <p className="text-xl text-zinc-400">
            Based on historical data and team statistics
          </p>
        </div>

        <div className="bg-zinc-900 shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Our Predicted March Madness Winners
            </h2>
            <button
              onClick={() => setIsPieChart(!isPieChart)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isPieChart ? 'Show Bar Chart' : 'Show Pie Chart'}
            </button>
          </div>
          
          {isPieChart ? renderPieChart() : renderBarChart()}
        </div>

        <div className="mt-8 text-center text-zinc-400">
          <p>
            * Predictions are based on historical data and current season statistics.
            <br />
            Last updated: {'March 1st, 2025'}
          </p>
        </div>
      </div>
    </div>
  );
} 