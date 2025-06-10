import newStyled from '@emotion/styled';

const MessageContainer = newStyled('div')({
  background: 'var(--background_variant, #F2F4F7)',
  padding: 'var(--space_always_xs, 8px)',
  gap: 'var(--space_always_xs, 8px)',
  borderRadius: 12,
  alignSelf: 'stretch',
});
const MessageContent = newStyled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space_s, 8px)',
  padding: 'var(--space_m, 8px)',
  border: '1px dashed var(--hairline_default, #D5D7DB)',
  borderRadius: 4,
  alignItems: 'center',
  textAlign: 'center',

  'i.w-icon': {
    fontSize: 48,
    background:
      'linear-gradient(45deg, var(--script_primary, #B80000), var(--script_secondary, #FF8F57))',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
});

const AuxiliaryLabel = newStyled('span')({
  fontSize: 12,
  color: 'var(--content_p2, #6B7280)',
});

interface PresetsListMessageProps {
  isSlashed?: boolean;
  title: string;
  message: string;
}
export function PresetsListMessage({
  title,
  message,
}: PresetsListMessageProps) {
  return (
    <MessageContainer>
      <MessageContent>
        <i className="w-icon w-icon-project-fill" />
        <wz-body2>{title}</wz-body2>
        <AuxiliaryLabel>{message}</AuxiliaryLabel>
      </MessageContent>
    </MessageContainer>
  );
}
