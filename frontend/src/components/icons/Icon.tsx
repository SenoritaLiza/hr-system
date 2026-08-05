import type { SVGProps } from "react";

export type IconName =
  | "grid"
  | "upload"
  | "users"
  | "star"
  | "chart"
  | "settings"
  | "search"
  | "bell"
  | "chevron-down"
  | "chevron-right"
  | "check-circle"
  | "alert-triangle"
  | "x-circle"
  | "filter"
  | "arrow-left"
  | "log-out"
  | "clock"
  | "file"
  | "cpu"
  | "plus"
  | "trash"
  | "download"
  | "shield"
  | "info"
  | "briefcase"
  | "graduation"
  | "trend"
  | "shield-check"
  | "mail"
  | "calendar"
  | "history"
  | "database"
  | "refresh"
  | "key"
  | "scale";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, className, ...rest }: IconProps) {
  return (
    <svg className={`icon${className ? ` ${className}` : ""}`} {...rest}>
      <use href={`#i-${name}`} />
    </svg>
  );
}