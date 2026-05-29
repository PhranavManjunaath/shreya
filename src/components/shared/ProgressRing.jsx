import { motion } from "framer-motion";
import useMediaQuery from "../../lib/useMediaQuery.js";

export default function ProgressRing({ pct }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const size = isMobile ? 100 : 130;
  const r = 54,
    c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const cx = 65,
    cy = 65;

  return (
    <svg width={size} height={size} viewBox="0 0 130 130">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(57,255,20,0.08)"
        strokeWidth={8}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#39ff14"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform="rotate(-90 65 65)"
      />
      <text
        x={cx}
        y={isMobile ? 58 : 62}
        textAnchor="middle"
        fill="#e8e8e8"
        fontFamily="'Orbitron', sans-serif"
        fontWeight={700}
        fontSize={20}
      >
        {pct}%
      </text>
      <text
        x={cx}
        y={isMobile ? 75 : 80}
        textAnchor="middle"
        fill="#555"
        fontFamily="'Space Mono', monospace"
        fontSize={9}
      >
        COMPLETE
      </text>
    </svg>
  );
}
