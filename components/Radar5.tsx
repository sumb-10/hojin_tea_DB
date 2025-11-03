"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface Radar5Props {
  title: string;
  labels: string[];
  values: number[];
  max: number;
  rings?: number;
}

export function Radar5({ title, labels, values, max, rings = 5}: Radar5Props) {
  const data = labels.map((label, index) => ({
    attribute: label,
    value: values[index] || 0,
  }));

  // 0 ~ max를 rings 등분한 tick 배열
  const step = max / rings;

  return (
    <div className="space-y-4">
      <h3 className="text-[18px] leading-[26px] text-[#111111]">{title}</h3>
      <div className="h-[300px] w-full bg-[#F7F7F7] rounded-[10px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#E5E5E5" />
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fill: "#666666", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, max]}
              scale="linear"                  // 선형 스케일 고정
              tickCount={rings + 1}              // 링 개수 + 1 (0 포함)
              allowDecimals={true}           // 라벨은 정수로 표시(원하면 true로)
              tick={{ fill: "#666666", fontSize: 10 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#111111"
              fill="#111111"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
