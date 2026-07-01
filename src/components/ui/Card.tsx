import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function Card({ className, title, description, children, ...props }: CardProps) {
  return (
    <div className={cn('card p-6', className)} {...props}>
      {title && <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>}
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      {children}
    </div>
  );
}
