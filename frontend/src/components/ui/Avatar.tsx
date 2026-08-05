import styles from "@/components/ui/Avatar.module.css";

interface AvatarProps {
  initials: string;
  size?: number;
}

export function Avatar({ initials, size }: AvatarProps) {
  const style = size ? { width: size, height: size, fontSize: size * 0.34 } : undefined;
  return (
    <div className={styles.avatar} style={style}>
      {initials}
    </div>
  );
}