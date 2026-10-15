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
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>

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
