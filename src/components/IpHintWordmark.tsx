import { Inter } from "next/font/google";
import { Fragment, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const BRAND_TOKEN_REGEX = /(IpHint|IPHINT|ipHint)/g;
const BRAND_TOKENS = new Set(["IpHint", "IPHINT", "ipHint"]);
const inter = Inter({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

type IpHintWordmarkProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: ElementType;
  size?: CSSProperties["fontSize"];
  color?: CSSProperties["color"];
  hScale?: number;
  hStrokeWidth?: CSSProperties["WebkitTextStrokeWidth"];
};

export default function IpHintWordmark({
  as: Component = "span",
  className,
  size,
  color,
  style,
  hScale = 0.74,
  hStrokeWidth = "0.028em",
  ...props
}: IpHintWordmarkProps) {
  return (
    <Component
      {...props}
      aria-label="IpHint"
      className={cn(inter.className, "inline-flex items-baseline whitespace-nowrap leading-none", className)}
      style={{
        ...style,
        color: color ?? style?.color,
        fontSize: size ?? style?.fontSize,
        fontWeight: 700,
      }}
    >
      <span aria-hidden="true">Ip</span>
      <span
        aria-hidden="true"
        style={{
          fontSize: `${hScale}em`,
          lineHeight: 1,
          WebkitTextStrokeColor: "currentColor",
          WebkitTextStrokeWidth: hStrokeWidth,
          paintOrder: "stroke fill",
        }}
      >
        H
      </span>
      <span aria-hidden="true">int</span>
    </Component>
  );
}

export function renderTextWithIpHintWordmark(
  text: string,
  wordmarkProps: Omit<IpHintWordmarkProps, "children"> = {},
): ReactNode {
  if (!text) {
    return text;
  }

  const parts = text.split(BRAND_TOKEN_REGEX);
  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => {
    if (BRAND_TOKENS.has(part)) {
      return <IpHintWordmark key={`wordmark-${index}`} {...wordmarkProps} />;
    }

    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
}