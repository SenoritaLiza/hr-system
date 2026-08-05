import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "@/components/ui/Button.module.css";

export type ButtonVariant = "default" | "primary" | "ghost" | "danger";
export type ButtonSize = "default" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  block,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.btn];
  if (variant !== "default") classes.push(styles[`btn-${variant}`]);
  if (size === "sm") classes.push(styles["btn-sm"]);
  if (block) classes.push(styles["btn-block"]);
  if (className) classes.push(className);

  return (
    <button className={classes.join(" ")} {...rest}>
      {children}
    </button>
  );
}