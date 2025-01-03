import type {SVGProps} from "react";

const SvgXcodeFlow2 = ({ color = "currentColor", ...props}: {
    size?: number | string;
    color?: string
} & SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" color={color} width="200" height="180" {...props}>
        <path fill="transparent" d="M0 0h200v200H0z"/>
        <text
            x={46}
            y={110}
            fill="url(#xcodeflow2_svg__a)"
            fontFamily="Arial, sans-serif"
            fontSize={18}
            fontWeight="bold"
        >
            {"\n    XcodeFlow\n  "}
        </text>
        <defs>
            <linearGradient
                id="xcodeflow2_svg__a"
                x1="0%"
                x2="100%"
                y1="0%"
                y2="100%"
            >
                <stop
                    offset="0%"
                    style={{
                        stopColor: "#22c1c3",
                        stopOpacity: 1,
                    }}
                />
                <stop
                    offset="100%"
                    style={{
                        stopColor: "#fdbb2d",
                        stopOpacity: 1,
                    }}
                />
            </linearGradient>
        </defs>
        <path
            fill="#FDBB2D"
            d="m57.574 26.515 28.284 48.99-24.495 14.142-28.284-48.99z"
            opacity={0.4}
        />
        <path
            fill="#22C1C3"
            d="m76.892 31.692 28.284 48.99-24.495 14.142-28.284-48.99z"
            opacity={0.4}
        />
        <path
            fill="#FDBB2D"
            d="m101.387 17.55 28.284 48.99-24.495 14.141-28.284-48.99z"
            opacity={0.4}
        />
        <path
            fill="#22C1C3"
            d="m120.706 22.726 28.284 48.99-24.495 14.142-28.284-48.99z"
            opacity={0.4}
        />
    </svg>
);
export default SvgXcodeFlow2;
