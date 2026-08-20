"use client";

import { useId } from "react";

import { MorphPath } from "~/app/_components/motion-system";

export function ProductSignalLeft({ className = "" }: { className?: string }) {
  const gradientId = useId().replace(/:/g, "");
  const fillId = `product-signal-fill-${gradientId}`;
  const darkFillId = `product-signal-dark-fill-${gradientId}`;
  const innerFillId = `product-signal-inner-${gradientId}`;
  const shapePaths = [
    "M72 96C108 34 184 34 230 76C270 112 326 98 348 150C376 214 312 260 250 288C190 314 156 342 106 314C54 286 78 242 42 202C8 164 28 122 72 96Z",
    "M104 62C148 22 214 48 242 100C270 150 338 122 354 184C374 256 292 276 226 268C164 260 148 326 94 294C38 260 78 222 38 180C0 140 58 100 104 62Z",
    "M54 122C90 50 168 26 226 62C284 98 304 118 346 154C390 194 326 272 272 306C218 340 168 320 114 304C58 288 72 240 34 200C-2 162 12 142 54 122Z",
    "M92 70C132 18 208 28 238 88C266 142 332 106 362 164C394 226 306 270 240 300C176 330 136 322 90 294C40 262 86 226 38 184C0 148 50 108 92 70Z",
    "M64 108C100 34 178 44 224 68C270 92 324 108 344 168C364 226 318 284 252 284C186 284 174 340 112 318C54 298 70 248 38 208C8 172 20 134 64 108Z",
    "M72 96C108 34 184 34 230 76C270 112 326 98 348 150C376 214 312 260 250 288C190 314 156 342 106 314C54 286 78 242 42 202C8 164 28 122 72 96Z",
  ];
  const offsetShapePaths = [
    "M118 72C154 20 226 42 252 94C278 144 344 122 360 180C378 246 296 288 228 278C164 268 140 322 86 286C32 250 78 212 36 174C0 138 72 110 118 72Z",
    "M54 118C92 48 176 24 226 70C276 116 318 96 352 150C390 212 316 258 266 304C216 350 168 328 114 310C60 292 66 248 30 204C-4 164 12 144 54 118Z",
    "M92 64C136 16 206 36 238 88C270 138 334 104 366 166C398 228 300 278 236 300C174 322 146 340 94 304C44 268 88 228 42 186C2 148 50 106 92 64Z",
    "M66 102C104 32 190 42 228 78C266 112 324 118 342 174C360 230 312 296 244 288C178 280 172 330 108 312C48 292 68 240 36 204C6 170 24 130 66 102Z",
    "M108 66C150 32 212 48 244 104C274 156 348 130 356 194C364 256 280 270 216 260C154 250 148 328 90 294C34 260 78 216 36 178C-2 142 66 100 108 66Z",
    "M118 72C154 20 226 42 252 94C278 144 344 122 360 180C378 246 296 288 228 278C164 268 140 322 86 286C32 250 78 212 36 174C0 138 72 110 118 72Z",
  ];
  const transition = {
    duration: 10,
    ease: "linear" as const,
    repeat: Infinity,
    times: [0, 0.16, 0.36, 0.58, 0.8, 1],
  };
  const offsetTransition = {
    ...transition,
    duration: transition.duration * 1.37,
    times: [0, 0.13, 0.34, 0.55, 0.77, 1],
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 opacity-80 dark:opacity-45 ${className}`}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 384 384"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <linearGradient id={fillId} x1="52" y1="48" x2="330" y2="318">
            <stop stopColor="rgb(8 145 178)" stopOpacity="0.34" />
            <stop offset="0.56" stopColor="rgb(20 184 166)" stopOpacity="0.2" />
            <stop offset="1" stopColor="rgb(246 255 83)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={darkFillId} x1="52" y1="48" x2="330" y2="318">
            <stop stopColor="rgb(0 188 187)" stopOpacity="0.34" />
            <stop
              offset="0.58"
              stopColor="rgb(20 184 166)"
              stopOpacity="0.24"
            />
            <stop offset="1" stopColor="rgb(125 211 252)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={innerFillId} x1="90" y1="72" x2="302" y2="280">
            <stop stopColor="rgb(125 211 252)" stopOpacity="0.32" />
            <stop offset="1" stopColor="rgb(20 184 166)" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <g transform="translate(-20 0)">
          <MorphPath
            className="fill-[#eff8fa] dark:fill-[#06111f]"
            paths={shapePaths}
            transition={transition}
            fill={`url(#${fillId})`}
          />
          <MorphPath
            className="dark:hidden"
            paths={shapePaths}
            transition={transition}
            fill={`url(#${fillId})`}
            opacity={"0.15"}
          />
          <MorphPath
            className="hidden dark:block"
            paths={shapePaths}
            transition={transition}
            fill={`url(#${darkFillId})`}
            opacity={"0.18"}
          />
        </g>
        <g transform="translate(-15 -20)">
          <MorphPath
            className="dark:hidden"
            paths={offsetShapePaths}
            transition={offsetTransition}
            fill={`url(#${fillId})`}
            opacity={"0.2"}
          />
          <MorphPath
            className="hidden dark:block"
            paths={offsetShapePaths}
            transition={offsetTransition}
            fill={`url(#${darkFillId})`}
            opacity={"0.24"}
          />
        </g>
      </svg>
    </div>
  );
}
