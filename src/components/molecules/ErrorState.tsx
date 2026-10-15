import { Text } from "@/components/atoms/Text";
import styles from "./ErrorState.module.scss";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
};

export function ErrorState({
  title = "Unable to load market data.",
  message,
  onRetry,
  isRetrying,
}: ErrorStateProps) {
  return (
    <section className={styles.container} role="alert">
      <Text variant="heading" as="h2" className={styles.title}>
        {title}
      </Text>
      <Text variant="body" className={styles.message}>
        {message}
      </Text>

      <button
        className={styles.retryButton}
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
      >
        {isRetrying ? "Retrying..." : "Try again"}
      </button>
    </section>
  );
}
