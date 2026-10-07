import { forwardRef, useEffect, type ElementType, type HTMLAttributes } from 'react';
import '../../tokens/tokens.css';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: 'outlined' | 'elevated' | 'filled';
  padding?: 'sm' | 'md' | 'lg';
  /**
   * Element to render. "section" and "article" need an accessible name
   * (aria-label or aria-labelledby). "li" must be a direct child of a list.
   */
  as?: 'div' | 'section' | 'article' | 'li';
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'outlined', padding = 'md', as = 'div', className, children, ...rest },
  ref,
) {
  const Component = as as ElementType;
  const needsName = as === 'section' || as === 'article';
  const hasName = Boolean(rest['aria-label'] || rest['aria-labelledby']);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && needsName && !hasName) {
      console.warn(
        `Card: as="${as}" needs an accessible name (aria-label or aria-labelledby), or use as="div".`,
      );
    }
  }, [as, needsName, hasName]);

  const classes = [styles.card, styles[variant], styles[padding], className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <Component {...rest} ref={ref} className={classes}>
      {children}
    </Component>
  );
});
