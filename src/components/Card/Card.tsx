import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import '../../tokens/tokens.css';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: 'outlined' | 'elevated' | 'filled';
  padding?: 'sm' | 'md' | 'lg';
  /** Element to render. Use "article" or "section" when the card is a landmark of its own. */
  as?: 'div' | 'section' | 'article' | 'li';
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'outlined', padding = 'md', as = 'div', className, children, ...rest },
  ref,
) {
  const Component = as as ElementType;
  const classes = [styles.card, styles[variant], styles[padding], className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <Component {...rest} ref={ref} className={classes}>
      {children}
    </Component>
  );
});
