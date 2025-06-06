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
const disableTopPaddingClass = css({
  paddingTop: 'unset',
});

interface ClosureEditorGroupProps {
  disableTopPadding?: boolean;
  hasBorder?: boolean;
  children: ReactNode;
}
export function ClosureEditorGroup({
  disableTopPadding,
  hasBorder,
  children,
}: ClosureEditorGroupProps) {
  return (
    <div
      className={clsx(
        groupClass,
        hasBorder && groupWithBorderClass,
        disableTopPadding && disableTopPaddingClass,
      )}
    >
      {children}
    </div>
  );
}
