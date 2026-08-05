import type { HTMLAttributes, ReactNode } from "react";
import styles from "@/components/ui/Card.module.css";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  children: ReactNode;
}

export function Card({ padded, className, children, ...rest }: CardProps) {
  const classes = [styles.card];
  if (padded) classes.push(styles["card-pad"]);
  if (className) classes.push(className);
  return (
    <div className={classes.join(" ")} {...rest}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, hint, action }: CardHeaderProps) {
  return (
    <div className={styles["card-header"]}>
      <h2>{title}</h2>
      {action ?? (hint && <span className={styles.hint}>{hint}</span>)}
    </div>
  );
}