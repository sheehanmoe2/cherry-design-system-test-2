import {
  forwardRef,
  useEffect,
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
  const iconOnly = !hasContent(children);
  const hasAccessibleName = Boolean(
    rest['aria-label'] || rest['aria-labelledby'] || rest.title,
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && iconOnly && !hasAccessibleName) {
      console.warn(
        'Button: icon-only buttons need an accessible name (aria-label, aria-labelledby, or title).',
      );
    }
  }, [iconOnly, hasAccessibleName]);

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

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      aria-busy={loading ? 'true' : undefined}
      onClick={handleClick}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        hasContent(leftIcon) && (
          <span className={styles.icon} aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      {hasContent(children) && <span>{children}</span>}
      {hasContent(rightIcon) && (
        <span className={styles.icon} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
