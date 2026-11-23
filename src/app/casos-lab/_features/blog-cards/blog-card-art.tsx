import { useId } from "react";

/** Local editorial illustrations: verification, source lineage and knowledge. */
export function BlogCardArt({
  topic,
  immersive = false,
}: {
  topic: number;
  immersive?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const dark = immersive;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 400"
      fill="none"
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient
          id={`${id}-bg`}
          x1="0"
          y1="0"
          x2="600"
          y2="400"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor={dark ? "#071a2b" : topic === 1 ? "#c2eae4" : "#e7f3f6"}
          />
          <stop
            offset="1"
            stopColor={dark ? "#103f4b" : topic === 1 ? "#80c5c1" : "#c7e2e9"}
          />
        </linearGradient>
        <linearGradient
          id={`${id}-glass`}
          x1="180"
          y1="60"
          x2="430"
          y2="340"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f4ffff" stopOpacity={dark ? ".85" : "1"} />
          <stop offset=".35" stopColor="#b4f1ea" stopOpacity=".45" />
          <stop offset=".7" stopColor="#087b85" stopOpacity=".8" />
          <stop offset="1" stopColor="#023d58" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="var(--color-primary-dark)" stopOpacity={dark ? ".22" : ".45"} />
          <stop offset="1" stopColor="var(--color-primary-dark)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-sphere`} cx=".32" cy=".23" r=".85">
          <stop stopColor="#c7fff6" />
          <stop offset=".3" stopColor="#55c9c3" />
          <stop offset=".7" stopColor="#08707e" />
          <stop offset="1" stopColor="#072d4a" />
        </radialGradient>
        <pattern
          id={`${id}-dots`}
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="1"
            cy="1"
            r=".7"
            fill={dark ? "#c5f8f5" : "#006d79"}
            opacity=".2"
          />
        </pattern>
        <filter
          id={`${id}-shadow`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <path fill={`url(#${id}-bg)`} d="M0 0h600v400H0z" />
      <path fill={`url(#${id}-dots)`} d="M0 0h600v400H0z" />
      <ellipse cx="320" cy="170" rx="270" ry="220" fill={`url(#${id}-glow)`} />
      {topic === 0 ? (
        <>
          <ellipse
            cx="315"
            cy="310"
            rx="120"
            ry="18"
            fill="#002e47"
            opacity=".18"
            filter={`url(#${id}-shadow)`}
          />
          <g transform="translate(300 191) rotate(-26)">
            <circle
              r="122"
              stroke={dark ? "#b8f3ef" : "#f3ffff"}
              strokeOpacity=".5"
              strokeWidth="1"
            />
            <circle
              r="103"
              stroke="#003a57"
              strokeOpacity=".2"
              strokeWidth="24"
              transform="translate(6 10)"
            />
            <circle r="103" stroke={`url(#${id}-glass)`} strokeWidth="25" />
            <circle
              r="88"
              stroke="#f2ffff"
              strokeOpacity=".6"
              strokeWidth="1.5"
            />
            <path
              d="M-39 2 -9 31 45-29"
              transform="rotate(26)"
              stroke={dark ? "#c9fff5" : "#006d79"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="97" cy="-35" r="10" fill="#d4fff7" />
            <circle cx="97" cy="-35" r="4" fill="#006d79" />
          </g>
          <path
            d="M84 253h65m303-125h64M115 263v-20m385-105v-20"
            stroke={dark ? "#a5f4eb" : "#006d79"}
            opacity=".4"
          />
          <circle cx="149" cy="253" r="3" fill="#00bcbb" />
          <circle cx="452" cy="128" r="3" fill="#00bcbb" />
        </>
      ) : topic === 1 ? (
        <>
          <ellipse
            cx="300"
            cy="325"
            rx="140"
            ry="20"
            fill="#002e47"
            opacity=".18"
            filter={`url(#${id}-shadow)`}
          />
          <g transform="translate(302 182) rotate(-14) skewY(5)">
            <rect
              x="-97"
              y="-98"
              width="211"
              height="234"
              rx="13"
              fill="#087380"
              stroke="#baf1e8"
              strokeOpacity=".5"
            />
            <rect
              x="-111"
              y="-112"
              width="211"
              height="234"
              rx="13"
              fill="#6abcb9"
              stroke="#d8fff5"
              strokeOpacity=".65"
            />
            <rect
              x="-125"
              y="-126"
              width="211"
              height="234"
              rx="13"
              fill={dark ? "#c6ede7" : "#effcf8"}
            />
            <rect
              x="-101"
              y="-99"
              width="41"
              height="5"
              rx="2.5"
              fill="#007d83"
            />
            <path
              d="M-101-65H59M-101-49H36M-101-33H59M-101 16H59M-101 32H13M-101 48H46"
              stroke="#4c979b"
              strokeOpacity=".4"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect
              x="-101"
              y="-15"
              width="136"
              height="14"
              rx="3"
              fill="#00bcbb"
              opacity=".26"
            />
          </g>
          <path
            d="M340 163h70q24 0 24 24v51"
            stroke={dark ? "#c6fff7" : "#006d79"}
            strokeWidth="1.5"
            strokeDasharray="4 5"
          />
          <circle
            cx="434"
            cy="257"
            r="28"
            fill="#006d79"
            stroke="#aaf3e6"
            strokeWidth="2"
          />
          <path
            d="m423 257 8 8 15-16"
            stroke="#effffb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <ellipse
            cx="309"
            cy="315"
            rx="119"
            ry="16"
            fill="#010c17"
            opacity={dark ? ".7" : ".15"}
            filter={`url(#${id}-shadow)`}
          />
          <circle cx="304" cy="186" r="111" fill={`url(#${id}-sphere)`} />
          <g stroke="#c8fff5" strokeWidth=".8" opacity=".45">
            {[-80, -55, -28, 0, 28, 55, 80].map((y) => (
              <ellipse
                key={y}
                cx="304"
                cy={186 + y}
                rx={Math.sqrt(111 ** 2 - y ** 2)}
                ry={Math.sqrt(111 ** 2 - y ** 2) * 0.22}
              />
            ))}
            {[24, 53, 81, 105].map((rx) => (
              <ellipse
                key={rx}
                cx="304"
                cy="186"
                rx={rx}
                ry="111"
                transform="rotate(-25 304 186)"
              />
            ))}
          </g>
          <ellipse
            cx="304"
            cy="186"
            rx="155"
            ry="48"
            transform="rotate(-28 304 186)"
            stroke="#93eee5"
            strokeOpacity=".7"
          />
          <circle cx="438" cy="113" r="6" fill="#d5fff3" />
          <circle cx="182" cy="262" r="3" fill="#00bcbb" />
        </>
      )}
    </svg>
  );
}
