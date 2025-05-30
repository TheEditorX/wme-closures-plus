import { css } from '@emotion/css';
import newStyled from '@emotion/styled';
import { ClosurePreset } from 'interfaces/closure-preset';
import { useTranslation } from '../../hooks';
import { PresetListCardMenu } from './PresetListCardMenu';

const noMarginWzCard = css({
  '--wz-card-margin': 0,
});

const ContentContainer = newStyled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  overflow: 'hidden',
  gap: 'var(--space_always_xxs, 4px)',

  '& > div': {
    display: 'flex',
    justifyContent: 'space-between',
  },
});
const IconContainer = newStyled('div')({
  display: 'grid',
  placeItems: 'center',
  fontSize: 16,
  width: 32,
  aspectRatio: 1,
  borderRadius: '50%',
  background: 'var(--primary, #09f)',
  color: 'var(--on_primary, #fff)',
});

export interface PresetListCardProps {
  preset: ClosurePreset;
}
export function PresetListCard(props: PresetListCardProps) {
  const { unsafeT } = useTranslation();

  return (
    <wz-card className={noMarginWzCard} elevation-on-hover={1}>
      <ContentContainer>
        <div>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space_s, 12px)',
            })}
          >
            <IconContainer>
              <i className="w-icon w-icon-project-fill" />
            </IconContainer>
            <wz-h7>{props.preset.name}</wz-h7>
          </div>

          <PresetListCardMenu preset={props.preset} />
        </div>

        <wz-truncate limit={50}>
          <wz-body2>{props.preset.description}</wz-body2>
          <span slot="ellipsis">{unsafeT('common.show_more')}</span>
        </wz-truncate>
      </ContentContainer>
    </wz-card>
  );
}
