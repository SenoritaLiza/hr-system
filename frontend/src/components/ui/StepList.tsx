import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import styles from "@/components/ui/StepList.module.css";

export interface Step {
  icon: IconName;
  label: string;
  state: "done" | "active" | "pending";
}

export function StepList({ steps }: { steps: Step[] }) {
  return (
    <div className={styles["step-list"]}>
      {steps.map((step) => (
        <StepItem key={step.label} icon={step.icon} state={step.state}>
          {step.label}
        </StepItem>
      ))}
    </div>
  );
}

function StepItem({ icon, state, children }: { icon: IconName; state: Step["state"]; children: ReactNode }) {
  const stateClass = state !== "pending" ? styles[state] : "";
  return (
    <div className={`${styles["step-item"]} ${stateClass}`}>
      <Icon name={icon} />
      {children}
    </div>
  );
}