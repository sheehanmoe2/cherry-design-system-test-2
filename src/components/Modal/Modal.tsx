import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import '../../tokens/tokens.css';
import { Button } from '../Button/Button';
import styles from './Modal.module.css';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose: () => void;
  /** Visible heading. Without one, pass `aria-label` so the dialog still has a name. */
  title?: ReactNode;
  description?: ReactNode;
  /** Pinned below the scrolling body, typically action Buttons. */
  footer?: ReactNode;
  /** Use `alertdialog` for confirmations that need an explicit answer; it also defaults `closeOnOverlayClick` to false. */
  role?: 'dialog' | 'alertdialog';
  /** Surface treatment: brand-tinted fill, outlined, or flat. */
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  /** Defaults to true for `dialog` and false for `alertdialog`. */
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  /** Disables the close button, Escape, and overlay dismissal while work is pending. */
  busy?: boolean;
  /** Announced to screen readers while `busy`. */
  busyLabel?: string;
  closeLabel?: string;
  /** Element to focus on open. Defaults to the first focusable element in the body, else the dialog itself. */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),[tabindex]:not([tabindex="-1"])';

// Open modals, topmost last. Drives Escape handling, stacking order, the shared scroll lock, and inerting.
interface Entry {
  token: symbol;
  overlay: HTMLElement | null;
}
const stack: Entry[] = [];
let restoreScroll: (() => void) | null = null;
const inerted = new Set<HTMLElement>();

// Everything on the body except the topmost overlay is inert, so aria-modal is honored by every screen reader.
function syncInert() {
  const top = stack[stack.length - 1]?.overlay ?? null;
  for (const el of Array.from(document.body.children)) {
    if (!(el instanceof HTMLElement)) continue;
    const shouldBeInert = stack.length > 0 && el !== top;
    if (shouldBeInert && !el.inert) {
      el.inert = true;
      inerted.add(el);
    } else if (!shouldBeInert && inerted.has(el)) {
      el.inert = false;
      inerted.delete(el);
    }
  }
}

function lockScroll() {
  if (stack.length !== 1) return;
  const { body, documentElement } = document;
  const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
  const scrollbar = window.innerWidth - documentElement.clientWidth;
  body.style.overflow = 'hidden';
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  restoreScroll = () => {
    body.style.overflow = previous.overflow;
    body.style.paddingRight = previous.paddingRight;
  };
}

function unlockScroll() {
  if (stack.length === 0 && restoreScroll) {
    restoreScroll();
    restoreScroll = null;
  }
}

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    title,
    description,
    footer,
    role = 'dialog',
    variant = 'primary',
    size = 'md',
    closeOnOverlayClick = role !== 'alertdialog',
    closeOnEscape = true,
    showCloseButton = true,
    busy = false,
    busyLabel = 'Please wait',
    closeLabel = 'Close',
    initialFocusRef,
    className,
    children,
    ...rest
  },
  ref,
) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const key = useRef(Symbol('modal'));
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pressedOnOverlay = useRef(false);
  const [mounted, setMounted] = useState(open);
  const [level, setLevel] = useState(0);

  // Stay mounted while the exit animation plays.
  if (open && !mounted) setMounted(true);

  const setPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !title && !rest['aria-label'] && !rest['aria-labelledby']) {
      console.warn('Modal: pass a `title` or an `aria-label` so the dialog has an accessible name.');
    }
  }, [title, rest]);

  useLayoutEffect(() => {
    if (!open) return;
    const token = key.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    setLevel(stack.length);
    stack.push({ token, overlay: overlayRef.current });
    lockScroll();
    syncInert();

    // With no field in the body, focus the dialog itself so the title and description are read before any control.
    const panel = panelRef.current;
    const target =
      initialFocusRef?.current ?? panel?.querySelector<HTMLElement>(`.${styles.body} :is(${FOCUSABLE})`) ?? panel;
    target?.focus();

    return () => {
      stack.splice(stack.findIndex((entry) => entry.token === token), 1);
      unlockScroll();
      syncInert();
      // Deferred: React re-focuses the pre-commit element after this commit, which would undo an immediate restore.
      // Skip it if the user has already moved focus somewhere outside the dialog.
      window.setTimeout(() => {
        const active = document.activeElement;
        if (!active || active === document.body || panel?.contains(active)) previouslyFocused?.focus?.();
      }, 0);
    };
  }, [open, initialFocusRef]);

  // Fallback in case the exit animation never reports its end (hidden tab, no animation).
  useEffect(() => {
    if (open || !mounted) return;
    const duration = parseFloat(
      getComputedStyle(overlayRef.current ?? document.documentElement).getPropertyValue('--duration-modal'),
    );
    const timer = window.setTimeout(() => setMounted(false), (Number.isNaN(duration) ? 0.2 : duration) * 1000 + 100);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  if (!mounted || typeof document === 'undefined') return null;

  const isTop = () => stack[stack.length - 1]?.token === key.current;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // React events bubble through portals, so ignore keys meant for a modal stacked above this one.
    if (!open || !isTop()) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (closeOnEscape && !busy) onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    event.stopPropagation();
    const panel = panelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Only a press that started on the overlay counts, so drag-selecting text out of the dialog does not close it.
  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    pressedOnOverlay.current = event.target === event.currentTarget;
  };
  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    const startedOnOverlay = pressedOnOverlay.current;
    pressedOnOverlay.current = false;
    if (event.target !== event.currentTarget || !startedOnOverlay) return;
    if (open && isTop() && closeOnOverlayClick && !busy) onClose();
  };

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!open && event.target === event.currentTarget) setMounted(false);
  };

  const hasTitle = Boolean(title);
  const hasHeader = hasTitle || showCloseButton;
  const hasBody = (children != null && children !== false) || (!hasHeader && Boolean(description));

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      data-state={open ? 'open' : 'closed'}
      style={{ ['--modal-level' as string]: level }}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        {...rest}
        ref={setPanelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : rest['aria-labelledby']}
        aria-describedby={description ? descriptionId : rest['aria-describedby']}
        aria-busy={busy ? 'true' : undefined}
        tabIndex={-1}
        className={[styles.panel, styles[variant], styles[size], className ?? ''].filter(Boolean).join(' ')}
        data-state={open ? 'open' : 'closed'}
      >
        {hasHeader && (
          <header className={styles.header}>
            <div className={styles.headings}>
              {hasTitle && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                aria-label={closeLabel}
                className={styles.close}
                leftIcon={<CloseIcon />}
                aria-disabled={busy || undefined}
                onClick={busy ? undefined : onClose}
              />
            )}
          </header>
        )}
        {hasBody && (
          <div className={styles.body}>
            {!hasHeader && description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
            {children}
          </div>
        )}
        {footer && <footer className={styles.footer}>{footer}</footer>}
        <span role="status" className={styles.srOnly}>
          {busy ? busyLabel : ''}
        </span>
      </div>
    </div>,
    document.body,
  );
});
