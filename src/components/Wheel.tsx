import { motion } from "motion/react";

interface WheelProps {
  segments: string[];
  rotation: number;
  isSpinning: boolean;
}

const COLORS = [
  "#3498db", // Blue
  "#e67e22", // Orange
  "#2ecc71", // Green
  "#9b59b6", // Purple
  "#34495e", // Dark Blue
  "#1abc9c", // Teal
  "#f1c40f", // Yellow
];

export default function Wheel({ segments, rotation, isSpinning }: WheelProps) {
  const sliceAngle = 360 / segments.length;

  return (
    <div className="relative w-80 h-80 md:w-96 md:h-96">
      {/* Pointer */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-4xl text-red-500 drop-shadow-md">
        ▼
      </div>

      {/* Wheel Container */}
      <motion.div
        className="w-full h-full rounded-full border-8 border-white shadow-2xl overflow-hidden relative"
        animate={{ rotate: rotation }}
        transition={{
          duration: 4,
          ease: [0.17, 0.67, 0.1, 1], // Custom cubic-bezier for "spin" feel
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {segments.map((segment, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = (i + 1) * sliceAngle;
            
            // Convert polar to cartesian
            const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = sliceAngle > 180 ? 1 : 0;
            const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return (
              <g key={i}>
                <path
                  d={pathData}
                  fill={COLORS[i % COLORS.length]}
                  stroke="white"
                  strokeWidth="0.5"
                />
                <text
                  x="75"
                  y="50"
                  fill="white"
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${startAngle + sliceAngle / 2}, 50, 50)`}
                  className="select-none pointer-events-none drop-shadow-sm"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                >
                  {segment}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Center Cap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-inner border-4 border-gray-100 flex items-center justify-center z-10">
          <div className="w-4 h-4 bg-gray-300 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
