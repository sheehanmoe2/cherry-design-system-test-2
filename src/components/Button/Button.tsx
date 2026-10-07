import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import '../../tokens/tokens.css';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  /** Text announced to screen readers while `loading` is true. */
  loadingLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const hasContent = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== '';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingLabel = 'Loading',
    disabled,
    leftIcon,
    rightIcon,
    type = 'button',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLButtonElement | null>(null);
  const restingWidth = useRef(0);

  const setRefs = useCallback(
    (node: HTMLButtonElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const hasLabel = hasContent(children);
  const iconOnly = !hasLabel;
  const hasAccessibleName = Boolean(
    rest['aria-label'] || rest['aria-labelledby'] || rest.title,
  );
  // The spinner takes the place of an icon; an icon-only button keeps whichever icon slot it has.
  const spinnerOnRight = iconOnly && !hasContent(leftIcon) && hasContent(rightIcon);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && iconOnly && !hasAccessibleName) {
      console.warn(
        'Button: icon-only buttons need an accessible name (aria-label, aria-labelledby, or title).',
      );
    }
  }, [iconOnly, hasAccessibleName]);

  // Remember the resting width, then hold it while loading so the layout does not jump.
  useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    if (loading) {
      node.style.minWidth = `${restingWidth.current}px`;
    } else {
      node.style.minWidth = '';
      restingWidth.current = node.offsetWidth;
    }
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    loading ? styles.loading : '',
    iconOnly ? styles.iconOnly : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const spinner = (
    <span className={styles.icon} aria-hidden="true">
      <span className={styles.spinner} />
    </span>
  );
  const icon = (node: ReactNode) =>
    hasContent(node) && (
      <span className={styles.icon} aria-hidden="true">
        {node}
      </span>
    );

  return (
    <>
      <button
        {...rest}
        ref={setRefs}
        type={type}
        className={classes}
        disabled={disabled}
        aria-busy={loading ? 'true' : undefined}
        onClick={handleClick}
      >
        {loading && !spinnerOnRight ? spinner : icon(leftIcon)}
        {hasLabel && <span>{children}</span>}
        {loading && spinnerOnRight ? spinner : icon(rightIcon)}
      </button>
      <span role="status" className={styles.srOnly}>
        {loading ? loadingLabel : ''}
      </span>
    </>
  );
});
