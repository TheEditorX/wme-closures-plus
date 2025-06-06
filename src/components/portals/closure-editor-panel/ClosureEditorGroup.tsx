import { css } from '@emotion/css';
import clsx from 'clsx';
import { ReactNode } from 'react';

const groupClass = css({
  padding: 'var(--trimmed-padding)',
  width: '100%',
  flex: '1 1 auto', // Make it grow and take all available space in flexbox context
});
const groupWithBorderClass = css({
  borderBottom: '1px solid var(--hairline)',
});

interface ClosureEditorGroupProps {
  hasBorder?: boolean;
  children: ReactNode;
}
export function ClosureEditorGroup({
  hasBorder,
  children,
}: ClosureEditorGroupProps) {
  return (
    <div className={clsx(groupClass, hasBorder && groupWithBorderClass)}>
      {children}
    </div>
  );
}
