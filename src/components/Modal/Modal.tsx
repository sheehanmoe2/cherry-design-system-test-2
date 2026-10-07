import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import '../../tokens/tokens.css';
import { Button } from '../Button/Button';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  /** Called on Escape, backdrop click, or the close button. */
  onClose: () => void;
  /** Visible heading; also the dialog's accessible name. */
  title: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Action area pinned to the bottom (typically Buttons). */
  footer?: ReactNode;
  /** Close when the backdrop is clicked. Defaults to true. */
  closeOnBackdropClick?: boolean;
  /** Accessible name for the close button. */
  closeLabel?: string;
  className?: string;
  /** Body content. */
  children?: ReactNode;
}

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  footer,
  closeOnBackdropClick = true,
  closeLabel = 'Close',
  className,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // The native <dialog> provides the focus trap, inert background, Escape handling,
  // and returns focus to the opener when closed.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    // Clicks on the dialog element itself (not its panel content) are backdrop clicks.
    if (closeOnBackdropClick && event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={[styles.dialog, styles[size], className ?? ''].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
      onCancel={(event) => {
        event.preventDefault(); // keep `open` as the single source of truth
        onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <Button variant="ghost" aria-label={closeLabel} leftIcon={<CloseIcon />} onClick={onClose} />
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
