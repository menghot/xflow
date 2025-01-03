import type { SVGProps } from "react";
const SvgXcodeflow = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={60}
    height={60}
    viewBox="20 0 60 60"
    {...props}
  >
    <path fill="transparent" d="M0 0h60v60H0z" />
    <text
      x={28}
      y={55}
      fill="url(#xcodeflow_svg__a)"
      fontFamily="Arial, sans-serif"
      fontSize={8}
      fontWeight="bold"
    >
      {"\n    Xcode\n  "}
    </text>
    <text
      x={52}
      y={55}
      fill="url(#xcodeflow_svg__b)"
      fontFamily="Arial, sans-serif"
      fontSize={8}
      fontWeight="bold"
    >
      {"\n    Flow\n  "}
    </text>
    <defs>
      <linearGradient id="xcodeflow_svg__a" x1="0%" x2="100%" y1="0%" y2="100%">
        <stop
          offset="0%"
          style={{
            stopColor: "#06f",
            stopOpacity: 1,
          }}
        />
        <stop
          offset="100%"
          style={{
            stopColor: "#22c1c3",
            stopOpacity: 1,
          }}
        />
      </linearGradient>
      <linearGradient id="xcodeflow_svg__b" x1="0%" x2="100%" y1="0%" y2="100%">
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
      fill="#E8B80C"
      d="m31.716 11.01 14.142 24.495-12.248 7.071-14.142-24.495z"
      opacity={0.4}
    />
    <path
      fill="#0DB3B5"
      d="m41.375 13.598 14.142 24.495-12.247 7.071L29.128 20.67z"
      opacity={0.4}
    />
    <path
      fill="#E8B80C"
      d="m53.622 6.527 14.143 24.495-12.248 7.071-14.142-24.495z"
      opacity={0.4}
    />
    <path
      fill="#0DB3B5"
      d="M63.282 9.116 77.424 33.61l-12.248 7.071-14.142-24.494z"
      opacity={0.4}
    />
  </svg>
);
export default SvgXcodeflow;
