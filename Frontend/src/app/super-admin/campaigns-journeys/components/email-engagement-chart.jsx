"use client";

import React, { useState } from "react";

const DATA_POINTS = [
  { day: "JUL 1", sent: 14000, opened: 9500, clicked: 22000 },
  { day: "JUL 2", sent: 20000, opened: 14000, clicked: 24000 },
  { day: "JUL 3", sent: 22500, opened: 13000, clicked: 23000 },
  { day: "JUL 4", sent: 18500, opened: 16000, clicked: 26000 },
  { day: "JUL 5", sent: 24000, opened: 15000, clicked: 25000 },
  { day: "JUL 6", sent: 27500, opened: 18000, clicked: 27000 },
  { day: "JUL 7", sent: 26000, opened: 17000, clicked: 26500 },
];

export default function EmailEngagementChart() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // SVG dimensions
  const width = 650;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minY = 5000;
  const maxY = 30000;

  const getX = (index) => {
    return paddingLeft + (index / (DATA_POINTS.length - 1)) * chartWidth;
  };

  const getY = (val) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return (
      paddingTop +
      chartHeight -
      ((clamped - minY) / (maxY - minY)) * chartHeight
    );
  };

  // Generate smooth SVG path
  const createPath = (key) => {
    return DATA_POINTS.map((d, i) => {
      const x = getX(i);
      const y = getY(d[key]);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const yTicks = [
    { label: "30k", val: 30000 },
    { label: "25k", val: 25000 },
    { label: "20k", val: 20000 },
    { label: "15k", val: 15000 },
    { label: "10k", val: 10000 },
    { label: "5k", val: 5000 },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
      <div>
        {/* Header and Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
            Email Engagement
          </h3>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium text-dark-black/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0EADAB]" />
              <span>Sent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span>Opened</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <span>Clicked</span>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full relative mt-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tick) => {
              const y = getY(tick.val);
              return (
                <g key={tick.label}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#F1F5F9"
                    strokeWidth="1.2"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-medium"
                  >
                    {tick.label}
                  </text>
                </g>
              );
            })}

            {/* X-Axis Labels */}
            {DATA_POINTS.map((d, i) => {
              const x = getX(i);
              return (
                <text
                  key={d.day}
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-semibold uppercase tracking-wider"
                >
                  {d.day}
                </text>
              );
            })}

            {/* Path 1: Sent (Teal) */}
            <path
              d={createPath("sent")}
              fill="none"
              stroke="#0EADAB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path 2: Opened (Purple) */}
            <path
              d={createPath("opened")}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path 3: Clicked (Blue) */}
            <path
              d={createPath("clicked")}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Markers & Hover Zones */}
            {DATA_POINTS.map((d, i) => {
              const x = getX(i);
              const ySent = getY(d.sent);
              const yOpened = getY(d.opened);
              const yClicked = getY(d.clicked);

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Vertical Guide Line on Hover */}
                  {hoveredIdx === i && (
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={height - paddingBottom}
                      stroke="#94A3B8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Sent Dot */}
                  <circle
                    cx={x}
                    cy={ySent}
                    r={hoveredIdx === i ? "5.5" : "3.5"}
                    fill="#FFFFFF"
                    stroke="#0EADAB"
                    strokeWidth="2.5"
                  />

                  {/* Opened Dot */}
                  <circle
                    cx={x}
                    cy={yOpened}
                    r={hoveredIdx === i ? "5.5" : "3.5"}
                    fill="#FFFFFF"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                  />

                  {/* Clicked Dot */}
                  <circle
                    cx={x}
                    cy={yClicked}
                    r={hoveredIdx === i ? "5.5" : "3.5"}
                    fill="#FFFFFF"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                  />
                </g>
              );
            })}
          </svg>

          {/* Tooltip Overlay */}
          {hoveredIdx !== null && (
            <div
              style={{
                left: `${(getX(hoveredIdx) / width) * 100}%`,
              }}
              className="absolute top-2 -translate-x-1/2 bg-white/95 backdrop-blur-xs border border-light-gray shadow-md rounded-xl p-2.5 pointer-events-none z-20 flex flex-col gap-1 min-w-[120px]"
            >
              <span className="text-[11px] font-bold text-dark-black border-b border-light-gray/60 pb-1">
                {DATA_POINTS[hoveredIdx].day}
              </span>
              <div className="flex items-center justify-between text-[10px] text-dark-black/90">
                <span className="flex items-center gap-1 text-[#0EADAB] font-semibold">
                  ● Sent:
                </span>
                <span className="font-bold">
                  {DATA_POINTS[hoveredIdx].sent.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-dark-black/90">
                <span className="flex items-center gap-1 text-[#8B5CF6] font-semibold">
                  ● Opened:
                </span>
                <span className="font-bold">
                  {DATA_POINTS[hoveredIdx].opened.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-dark-black/90">
                <span className="flex items-center gap-1 text-[#3B82F6] font-semibold">
                  ● Clicked:
                </span>
                <span className="font-bold">
                  {DATA_POINTS[hoveredIdx].clicked.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
