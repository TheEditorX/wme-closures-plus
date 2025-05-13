import { css } from '@emotion/css';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { isValidElement } from 'react';
import { useStepper } from './StepperContext';

const StepIndicatorContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-always-xs)',
});
const StepIndicatorContent = styled.div({
  display: 'flex',
  padding: 'var(--space-s, 12px) 0',
  alignItems: 'start',
  alignSelf: 'stretch',
  gap: 'var(--space-xs, 8px)',
});
const stepIndicatorDetailClass = css({
  display: 'block',
});
const stepIndicatorIconClass = css({
  fontSize: 20,
});

export function StepperIndicator() {
  const { currentStepIndex, totalSteps, currentStepConfig } = useStepper();

  return (
    <StepIndicatorContainer>
      <wz-progressbar
        size="md"
        progress={Math.floor((currentStepIndex / totalSteps) * 100)}
      />

      <StepIndicatorContent>
        {currentStepConfig.icon &&
          (isValidElement(currentStepConfig.icon) ?
            currentStepConfig.icon
          : <i
              className={clsx(
                'w-icon',
                `w-icon-${typeof currentStepConfig.icon === 'object' ? currentStepConfig.icon.name : currentStepConfig.icon}`,
                stepIndicatorIconClass,
              )}
              style={
                typeof currentStepConfig.icon === 'object' ?
                  { color: currentStepConfig.icon.color }
                : undefined
              }
            />)}

        <div>
          <wz-subhead5 className={stepIndicatorDetailClass}>
            Step {currentStepIndex + 1} of {totalSteps}
          </wz-subhead5>
          <wz-h6 className={stepIndicatorDetailClass}>
            {currentStepConfig.title}
          </wz-h6>
          {currentStepConfig.description && (
            <wz-caption className={stepIndicatorDetailClass}>
              {currentStepConfig.description}
            </wz-caption>
          )}
        </div>
      </StepIndicatorContent>
    </StepIndicatorContainer>
  );
}
