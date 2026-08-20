"use client";

import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

type SignalIntensity = "ambient" | "section" | "hero";

const signalShapePaths: Record<SignalIntensity, string[]> = {
  ambient: [
    "M854 -92C1048 -224 1394 -210 1570 -24C1742 156 1688 328 1744 468C1808 628 1678 876 1452 1012C1248 1136 1016 1086 884 948C760 818 844 662 744 552C646 444 596 318 710 164C760 96 756 -24 854 -92Z",
    "M884 -118C1088 -244 1428 -200 1588 -2C1750 198 1658 350 1740 502C1818 648 1644 924 1414 1036C1184 1148 980 1064 856 916C738 774 858 644 724 528C604 424 614 278 730 140C786 74 778 -56 884 -118Z",
    "M916 -142C1138 -250 1458 -176 1602 18C1758 230 1644 382 1730 536C1814 686 1608 966 1388 1058C1138 1162 948 1032 828 886C712 744 850 628 712 504C580 386 634 244 750 120C806 60 804 -88 916 -142Z",
    "M858 -102C1078 -262 1418 -238 1574 -48C1732 144 1714 386 1692 520C1668 664 1714 820 1486 1010C1284 1178 1038 1098 910 970C786 846 844 704 830 592C814 462 656 354 716 178C760 66 744 -30 858 -102Z",
    "M808 -62C1014 -246 1358 -246 1538 -66C1712 110 1738 372 1662 514C1588 654 1696 830 1512 984C1322 1142 1074 1114 940 996C812 882 804 728 852 604C906 464 636 380 704 196C744 92 702 10 808 -62Z",
    "M826 -72C1018 -214 1368 -232 1556 -54C1748 128 1738 314 1714 454C1686 612 1662 874 1480 1006C1284 1148 1068 1124 920 976C794 850 868 684 824 568C780 452 644 334 710 174C756 78 720 -2 826 -72Z",
    "M854 -92C1048 -224 1394 -210 1570 -24C1742 156 1688 328 1744 468C1808 628 1678 876 1452 1012C1248 1136 1016 1086 884 948C760 818 844 662 744 552C646 444 596 318 710 164C760 96 756 -24 854 -92Z",
  ],
  section: [
    "M840 -96C1042 -232 1404 -216 1576 -28C1748 160 1686 328 1746 470C1816 638 1674 884 1440 1020C1228 1144 998 1084 872 942C750 804 844 664 738 548C636 436 584 318 704 158C756 88 736 -28 840 -96Z",
    "M882 -128C1098 -250 1446 -196 1592 2C1744 210 1650 362 1742 514C1830 660 1634 942 1400 1044C1148 1154 966 1054 842 902C726 760 856 642 710 516C576 400 610 266 736 130C794 68 774 -68 882 -128Z",
    "M934 -154C1168 -256 1488 -166 1610 34C1756 274 1624 398 1730 546C1830 684 1584 994 1354 1070C1090 1156 918 1010 806 856C700 710 854 626 690 490C538 364 634 230 762 104C826 42 812 -102 934 -154Z",
    "M838 -104C1076 -278 1434 -248 1580 -58C1730 138 1730 398 1686 532C1638 680 1740 826 1498 1014C1288 1178 1028 1104 898 968C770 834 840 700 836 588C830 456 646 358 716 168C758 52 728 -26 838 -104Z",
    "M778 -54C982 -262 1360 -258 1540 -74C1720 110 1758 390 1658 522C1562 648 1714 816 1524 982C1318 1162 1058 1128 930 1000C790 860 790 724 864 596C940 462 608 384 696 184C738 82 660 18 778 -54Z",
    "M810 -68C1016 -226 1380 -246 1562 -56C1758 150 1738 326 1718 460C1692 632 1674 892 1478 1016C1262 1152 1062 1120 910 970C780 842 866 682 812 560C758 438 626 330 706 168C754 78 694 2 810 -68Z",
    "M840 -96C1042 -232 1404 -216 1576 -28C1748 160 1686 328 1746 470C1816 638 1674 884 1440 1020C1228 1144 998 1084 872 942C750 804 844 664 738 548C636 436 584 318 704 158C756 88 736 -28 840 -96Z",
  ],
  hero: [
    "M824 -102C1034 -242 1414 -222 1580 -30C1750 168 1682 330 1748 474C1824 646 1668 896 1428 1028C1204 1152 980 1080 860 934C740 788 846 666 732 542C624 424 570 316 696 150C750 78 718 -32 824 -102Z",
    "M878 -142C1110 -258 1468 -192 1598 12C1740 232 1638 378 1740 528C1840 672 1622 970 1376 1054C1100 1148 940 1038 820 874C710 724 860 632 692 500C534 376 610 248 750 112C816 48 770 -82 878 -142Z",
    "M962 -164C1202 -258 1524 -150 1618 48C1752 330 1596 416 1726 556C1850 690 1558 1030 1320 1080C1034 1140 890 986 786 824C690 674 860 622 668 474C494 340 636 214 778 86C850 22 824 -112 962 -164Z",
    "M812 -110C1074 -296 1454 -258 1586 -68C1724 130 1748 420 1678 542C1604 672 1768 830 1512 1018C1290 1182 1018 1110 880 960C742 810 836 700 850 586C868 442 632 362 708 154C748 26 710 -22 812 -110Z",
    "M742 -42C944 -284 1364 -272 1542 -82C1726 116 1780 414 1654 532C1538 642 1736 804 1538 980C1314 1180 1040 1140 918 1002C764 828 776 722 884 590C990 452 574 394 692 172C728 74 616 28 742 -42Z",
    "M790 -62C1008 -230 1390 -260 1572 -58C1776 168 1738 338 1724 464C1706 648 1686 910 1472 1026C1228 1158 1054 1118 892 956C750 814 866 676 808 550C750 424 620 326 710 162C754 84 664 8 790 -62Z",
    "M824 -102C1034 -242 1414 -222 1580 -30C1750 168 1682 330 1748 474C1824 646 1668 896 1428 1028C1204 1152 980 1080 860 934C740 788 846 666 732 542C624 424 570 316 696 150C750 78 718 -32 824 -102Z",
  ],
};

const signalInnerPaths: Record<SignalIntensity, string[]> = {
  ambient: [
    "M836 114C1036 2 1378 38 1514 218C1618 356 1454 438 1524 594C1592 748 1354 910 1118 842C950 794 862 690 902 560C944 422 758 306 836 114",
    "M812 96C1032 -10 1410 66 1522 248C1614 394 1428 456 1512 626C1590 784 1320 914 1080 824C906 758 846 662 900 524C958 378 704 274 812 96",
    "M780 88C1012 -18 1430 78 1532 278C1614 438 1412 476 1502 654C1584 816 1288 896 1050 802C882 736 842 628 894 496C950 354 668 252 780 88",
    "M868 126C1016 -28 1352 10 1498 180C1616 318 1502 420 1560 562C1626 724 1418 944 1160 890C960 848 874 720 910 586C950 438 820 322 868 126",
    "M930 156C1056 -12 1322 0 1478 154C1618 292 1536 404 1582 540C1640 712 1448 954 1182 906C984 870 882 748 908 606C936 456 866 324 930 156",
    "M874 138C1018 6 1368 8 1502 188C1612 336 1494 452 1544 588C1602 746 1394 930 1146 882C956 846 868 710 904 574C944 424 792 326 874 138",
    "M836 114C1036 2 1378 38 1514 218C1618 356 1454 438 1524 594C1592 748 1354 910 1118 842C950 794 862 690 902 560C944 422 758 306 836 114",
  ],
  section: [
    "M828 112C1034 -4 1384 40 1516 222C1624 370 1446 438 1524 602C1598 762 1344 916 1102 836C928 778 854 682 900 552C948 410 742 298 828 112",
    "M790 88C1030 -18 1422 72 1528 260C1616 424 1408 462 1504 642C1592 810 1304 910 1058 808C878 732 832 632 894 500C962 354 676 258 790 88",
    "M742 72C1002 -22 1464 92 1536 292C1598 462 1382 474 1482 666C1576 826 1258 894 1022 784C850 704 822 602 884 466C952 320 622 238 742 72",
    "M890 144C1012 -42 1332 -4 1484 158C1628 312 1524 394 1582 530C1654 698 1460 976 1190 920C974 876 874 738 904 596C940 430 842 344 890 144",
    "M970 188C1046 -28 1302 -18 1460 140C1638 318 1550 394 1592 514C1654 696 1484 976 1202 930C982 894 874 750 904 598C938 430 900 362 970 188",
    "M900 156C1018 -4 1368 -2 1496 184C1612 352 1500 438 1552 572C1616 736 1410 946 1160 888C960 842 866 716 902 574C944 416 812 340 900 156",
    "M828 112C1034 -4 1384 40 1516 222C1624 370 1446 438 1524 602C1598 762 1344 916 1102 836C928 778 854 682 900 552C948 410 742 298 828 112",
  ],
  hero: [
    "M818 108C1032 -10 1392 42 1518 226C1630 384 1438 438 1524 610C1604 776 1332 922 1088 830C908 762 846 674 898 544C952 398 724 290 818 108",
    "M766 78C1026 -22 1444 82 1532 274C1608 452 1384 462 1484 666C1578 838 1274 908 1032 786C850 694 818 606 890 476C968 334 634 246 766 78",
    "M700 54C990 -24 1504 108 1538 306C1580 490 1352 466 1462 682C1568 838 1224 886 994 760C818 664 802 574 876 436C954 292 570 224 700 54",
    "M918 172C1008 -58 1310 -24 1470 136C1648 314 1542 374 1600 502C1684 684 1506 1000 1214 944C974 898 866 756 898 594C940 406 876 362 918 172",
    "M1010 222C1034 -44 1282 -36 1442 126C1670 356 1564 378 1606 486C1678 676 1522 1002 1224 956C980 918 868 752 900 590C940 406 934 396 1010 222",
    "M912 166C1016 -2 1384 -2 1502 198C1610 382 1498 422 1562 560C1638 726 1428 960 1170 896C958 844 860 718 900 566C948 388 790 338 912 166",
    "M818 108C1032 -10 1392 42 1518 226C1630 384 1438 438 1524 610C1604 776 1332 922 1088 830C908 762 846 674 898 544C952 398 724 290 818 108",
  ],
};

const signalMorphDuration: Record<SignalIntensity, number> = {
  ambient: 32,
  section: 32,
  hero: 15,
};

function getPathNumbers(path: string) {
  return (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
}

function getPathDistance(from: string, to: string) {
  const fromNumbers = getPathNumbers(from);
  const toNumbers = getPathNumbers(to);

  if (fromNumbers.length !== toNumbers.length) return 1;

  return fromNumbers.reduce((distance, value, index) => {
    const delta = value - toNumbers[index]!;

    return distance + delta * delta;
  }, 0);
}

function getMorphTimes(paths: string[]) {
  const distances = paths
    .slice(1)
    .map((path, index) => Math.sqrt(getPathDistance(paths[index]!, path)));
  const totalDistance = distances.reduce(
    (total, distance) => total + distance,
    0,
  );

  if (totalDistance === 0) {
    return paths.map((_, index) => index / (paths.length - 1));
  }

  let elapsedDistance = 0;

  return [
    0,
    ...distances.map((distance) => {
      elapsedDistance += distance;

      return elapsedDistance / totalDistance;
    }),
  ];
}

function shiftMorphPaths(paths: string[], amount: number) {
  const closedPath = paths.at(-1);
  const uniquePaths =
    closedPath === paths[0] ? paths.slice(0, paths.length - 1) : paths;
  const shift = amount % uniquePaths.length;
  const shiftedPaths = [
    ...uniquePaths.slice(shift),
    ...uniquePaths.slice(0, shift),
  ];

  return [...shiftedPaths, shiftedPaths[0]!];
}

const signalShapeTimes: Record<SignalIntensity, number[]> = {
  ambient: getMorphTimes(signalShapePaths.ambient),
  section: getMorphTimes(signalShapePaths.section),
  hero: getMorphTimes(signalShapePaths.hero),
};

const signalInnerTimes: Record<SignalIntensity, number[]> = {
  ambient: getMorphTimes(signalInnerPaths.ambient),
  section: getMorphTimes(signalInnerPaths.section),
  hero: getMorphTimes(signalInnerPaths.hero),
};

const signalOffsetShapePaths: Record<SignalIntensity, string[]> = {
  ambient: shiftMorphPaths(signalShapePaths.ambient, 1),
  section: shiftMorphPaths(signalShapePaths.section, 1),
  hero: shiftMorphPaths(signalShapePaths.hero, 1),
};

const signalOffsetShapeTimes: Record<SignalIntensity, number[]> = {
  ambient: getMorphTimes(signalOffsetShapePaths.ambient),
  section: getMorphTimes(signalOffsetShapePaths.section),
  hero: getMorphTimes(signalOffsetShapePaths.hero),
};

export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [exiting, setExiting] = useState(false);
  const navigatingRef = useRef(false);

  useEffect(() => {
    navigatingRef.current = false;
    setExiting(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: globalThis.MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        navigatingRef.current
      ) {
        return;
      }

      const target = event.target;
      const link =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>("a[href]")
          : null;

      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        reducedMotion
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);

      if (
        destination.origin !== current.origin ||
        destination.pathname === current.pathname
      ) {
        return;
      }

      event.preventDefault();
      navigatingRef.current = true;
      setExiting(true);
      window.setTimeout(
        () =>
          router.push(
            `${destination.pathname}${destination.search}${destination.hash}`,
          ),
        180,
      );
    };

    document.addEventListener("click", handleClick, true);

    return () => document.removeEventListener("click", handleClick, true);
  }, [reducedMotion, router]);

  return (
    <MotionConfig reducedMotion="user" transition={{ ease: "easeOut" }}>
      {children}
      <AnimatePresence>
        {exiting && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-100 bg-[#deedf3] dark:bg-[#030916]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export function RouteEntrance({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
    >
      {children}
    </motion.div>
  );
}

export function HomeMotionBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white dark:bg-[#06111f]"
    >
      {/* <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.1),transparent_30%,rgba(13,148,136,0.08)_72%,transparent)] dark:bg-[linear-gradient(120deg,rgba(34,211,238,0.12),transparent_30%,rgba(20,184,166,0.08)_72%,transparent)]" /> */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)]" />
    </div>
  );
}

/**
 * Morphs an SVG path through `paths`, looping back to `paths[0]`.
 *
 * `initial` is required, not decorative: without it Framer Motion has no base
 * value for `d` on mount and renders one frame with `d="undefined"`, which the
 * browser rejects with a path-parsing error before the keyframes resolve.
 */
export function MorphPath({
  paths,
  ...props
}: Omit<ComponentProps<typeof motion.path>, "animate" | "d" | "initial"> & {
  paths: string[];
}) {
  const reducedMotion = useReducedMotion();
  const firstPath = paths[0];

  return (
    <motion.path
      {...props}
      d={firstPath}
      initial={{ d: firstPath }}
      animate={reducedMotion ? undefined : { d: paths }}
    />
  );
}

export function SignalField({
  className = "",
  intensity = "section",
  opacity,
}: {
  className?: string;
  intensity?: SignalIntensity;
  opacity?: number;
}) {
  const gradientId = useId().replace(/:/g, "");
  const strokeId = `signal-stroke-${gradientId}`;
  const fillId = `signal-fill-${gradientId}`;
  const shapePaths = signalShapePaths[intensity];
  const innerPaths = signalInnerPaths[intensity];
  const offsetShapePaths = signalOffsetShapePaths[intensity];
  const shapeOffset =
    intensity === "hero" ? 20 : intensity === "section" ? 40 : 60;
  const morphTransitionBase = {
    type: "tween" as const,
    duration: signalMorphDuration[intensity],
    repeat: Infinity,
    ease: "linear" as const,
  };
  const shapeMorphTransition = {
    ...morphTransitionBase,
    times: signalShapeTimes[intensity],
  };
  const innerMorphTransition = {
    ...morphTransitionBase,
    duration: signalMorphDuration[intensity] * 1.25,
    times: signalInnerTimes[intensity],
  };
  const offsetShapeMorphTransition = {
    ...morphTransitionBase,
    duration: signalMorphDuration[intensity] * 1.06,
    times: signalOffsetShapeTimes[intensity],
  };
  const fieldOpacity =
    opacity ??
    (intensity === "ambient" ? 0.72 : intensity === "hero" ? 0.94 : 0.78);

  return (
    <div
      aria-hidden="true"
      className={`signal-field pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: fieldOpacity }}
    >
      <svg
        className="dark:text-primary-dark absolute inset-0 h-full w-full text-cyan-700/42"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id={strokeId} x1="170" y1="60" x2="1270" y2="800">
            <stop stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.24" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="0.78" stopColor="currentColor" stopOpacity="0.72" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={fillId} x1="300" y1="0" x2="1100" y2="850">
            <stop
              className="dark:[stop-opacity:0.16]"
              stopColor="rgb(8 145 178)"
              stopOpacity="0.24"
            />
            <stop
              className="dark:[stop-opacity:0.10]"
              offset="0.52"
              stopColor="rgb(20 184 166)"
              stopOpacity="0.11"
            />
            <stop
              className="dark:[stop-opacity:0.04]"
              offset="1"
              stopColor="rgb(246 255 83)"
              stopOpacity="0.16"
            />
          </linearGradient>
        </defs>
        <path
          d="M-80 690C160 538 260 690 470 548C690 398 770 176 1028 192C1192 202 1284 300 1526 188"
          stroke={`url(#${strokeId})`}
          strokeWidth="3"
        />
        <path
          d="M-120 760C150 596 320 776 548 604C774 434 820 268 1058 278C1230 286 1326 378 1538 292"
          stroke={`url(#${strokeId})`}
          strokeWidth="2"
          opacity="0.78"
        />
        <path
          d="M-100 610C110 504 246 572 392 456C572 314 652 118 872 118C1088 118 1182 244 1532 106"
          stroke={`url(#${strokeId})`}
          strokeWidth="1.8"
          opacity="0.68"
        />
        <g transform={`translate(${shapeOffset} 0)`}>
          <MorphPath
            className="fill-[#eff8fa] dark:fill-[#06111f]"
            paths={shapePaths}
            transition={shapeMorphTransition}
          />
          <MorphPath
            paths={shapePaths}
            transition={shapeMorphTransition}
            fill={`url(#${fillId})`}
            opacity="0.45"
          />
          <g transform="translate(-24 60)">
            <MorphPath
              paths={offsetShapePaths}
              transition={offsetShapeMorphTransition}
              fill={`url(#${fillId})`}
              opacity="0.35"
            />
          </g>
          <MorphPath
            paths={shapePaths}
            transition={shapeMorphTransition}
            stroke={`url(#${strokeId})`}
            strokeWidth="1.7"
            opacity="0.62"
          />
          <MorphPath
            paths={innerPaths}
            transition={innerMorphTransition}
            stroke={`url(#${strokeId})`}
            strokeWidth="1.4"
            opacity="0.44"
          />
        </g>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_24%,rgba(246,255,83,0.13),transparent_38%)] dark:bg-[radial-gradient(ellipse_at_82%_24%,rgba(246,255,83,0.035),transparent_38%)]" />
    </div>
  );
}

export function MotionSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function Reveal({
  children,
  visible,
  delay = 0,
  className,
}: {
  children: ReactNode;
  visible: boolean;
  delay?: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: visible || reducedMotion ? 1 : 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.36,
        delay: visible ? delay : 0,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ViewportReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const revealRef = useRef<HTMLDivElement | null>(null);
  const previousScrollY = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    previousScrollY.current = window.scrollY;

    const updateVisibility = (mode: "initial" | "scroll" = "scroll") => {
      const element = revealRef.current;

      if (!element) return;

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > previousScrollY.current;
      const scrollingUp = currentScrollY < previousScrollY.current;
      const rect = element.getBoundingClientRect();
      if (rect.height === 0) return;

      const activationBottom = window.innerHeight * 1.12;
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, activationBottom) - Math.max(rect.top, 0),
      );
      const visibility = visibleHeight / rect.height;
      const passedActivationPoint =
        rect.bottom <= 0 || rect.top <= activationBottom;

      if (
        (mode === "initial" && passedActivationPoint) ||
        (scrollingDown && (passedActivationPoint || visibility >= 0.05))
      ) {
        setVisible(true);
      }

      if (scrollingUp && rect.top >= activationBottom) {
        setVisible(false);
      }

      previousScrollY.current = currentScrollY;
    };

    const handleScroll = () => updateVisibility("scroll");
    const handleResize = () => updateVisibility("initial");

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    updateVisibility("initial");
    const frameId = window.requestAnimationFrame(() =>
      updateVisibility("initial"),
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion]);

  return (
    <motion.div
      ref={revealRef}
      className={className}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: visible || reducedMotion ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4 }}
    >
      {children}
    </motion.div>
  );
}
