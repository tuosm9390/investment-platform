import { AlertCircle, RefreshCw } from 'lucide-react';
import styles from './ErrorBanner.module.css';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export default function ErrorBanner({
  message,
  onRetry,
  variant = 'error'
}: ErrorBannerProps) {
  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      <div className={styles.content}>
        <AlertCircle size={20} className={styles.icon} />
        <span className={styles.message}>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          <RefreshCw size={16} className={styles.retryIcon} />
          재시도
        </button>
      )}
    </div>
  );
}
