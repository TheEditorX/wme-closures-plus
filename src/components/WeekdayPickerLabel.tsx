import styled from '@emotion/styled';
import { ReactNode } from 'react';

const LabelContainer = styled('div')({
  display: 'flex',
  'wz-label': {
    flex: 1,
  },
});

export interface WeekdayPickerLabelProps {
  label: string;
  actions?: ReactNode;
}
export function WeekdayPickerLabel({
  label,
  actions,
}: WeekdayPickerLabelProps) {
  return (
    <LabelContainer>
      <wz-label>{label}</wz-label>
      {actions}
    </LabelContainer>
  );
}
