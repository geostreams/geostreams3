import { cn } from "@/lib/utils";

/**
 * Bathymetric contour lines: concentric, slightly irregular depth rings.
 * The lines draw in once on load (see `.contour-line` in index.css);
 * `prefers-reduced-motion` users get them static.
 */
const RINGS = [
    "M600 330 C690 300 790 340 820 420 C850 510 780 590 680 610 C570 632 470 590 450 500 C432 420 510 358 600 330Z",
    "M600 280 C720 240 850 300 890 410 C930 530 840 640 700 670 C550 700 410 640 385 510 C362 390 470 320 600 280Z",
    "M600 225 C750 175 915 255 960 400 C1005 550 890 690 715 730 C535 770 345 690 318 520 C292 365 430 270 600 225Z",
    "M600 165 C785 105 985 205 1035 390 C1090 585 945 750 735 795 C520 842 280 745 250 535 C222 345 400 215 600 165Z",
    "M600 100 C820 30 1060 150 1115 380 C1175 620 1000 810 755 860 C505 912 215 800 182 550 C150 325 370 160 600 100Z",
];

export function ContourBackdrop({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 1200 900"
            preserveAspectRatio="xMidYMid slice"
            className={cn("pointer-events-none text-primary", className)}
        >
            <g fill="none" stroke="currentColor" strokeWidth={1.25}>
                {RINGS.map((d, i) => (
                    <path
                        key={i}
                        d={d}
                        pathLength={1}
                        className="contour-line"
                        style={{
                            animationDelay: `${i * 0.18}s`,
                            opacity: 0.35 + i * 0.1,
                        }}
                    />
                ))}
            </g>
        </svg>
    );
}
