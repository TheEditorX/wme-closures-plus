import styled from '@emotion/styled';

export const TwoColumnsGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--space-always-xs, 8px)',
});

export const FlexRow = styled('div')({
  display: 'flex',
  gap: 'var(--space-always-xs, 8px)',
});

export const ToggleGroupContainer = styled('div')({
  display: 'flex',
  marginBottom: 'var(--space-always-xs, 8px)',
});

export const SpacedBlock = styled('div')({
  marginBottom: 'var(--space-always-xs, 8px)',
  display: 'block',
});
