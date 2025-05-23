import styled from '@emotion/styled';

export const ToggleButton = styled('button')({
  minWidth: 40,
  minHeight: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '"Waze Boing", "Waze Boing HB", "Rubik", sans-serif',
  borderRadius: 4,
  fontWeight: 500,

  color: 'var(--cp_toggle_button_color, var(--content_default, #202124))',
  backgroundColor: 'transparent',
  border: '1px solid var(--cp_toggle_button_border, var(--hairline, #d5d7db))',

  '&:hover': {
    backgroundColor:
      'rgb(from var(--cp_toggle_button_color, var(--content_default, #202124)) r g b / 0.04)',
  },
  '&:active': {
    backgroundColor:
      'rgb(from var(--cp_toggle_button_color, var(--content_default, #202124)) r g b / 0.1)',
  },

  '&.selected, &[data-highlighted]': {
    backgroundColor:
      'rgb(from var(--cp_toggle_button_selected_color, var(--primary_variant, #0075e3)) r g b / 0.1)',
    borderColor:
      'var(--cp_toggle_button_selected_border, var(--primary, #0075e3))',
    color: 'var(--cp_toggle_button_selected_color, var(--primary, #0075e3))',

    '&:hover': {
      backgroundColor:
        'rgb(from var(--cp_toggle_button_selected_color, var(--primary_variant, #0075e3)) r g b / 0.14)',
    },
    '&:active': {
      backgroundColor:
        'rgb(from var(--cp_toggle_button_selected_color, var(--primary_variant, #0075e3)) r g b / 0.2)',
    },
  },
});
export const PositionAwareToggleButton = styled(ToggleButton)({
  '&:not(:last-of-type)': {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  '&:not(:first-of-type)': {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  '&.selected, &[data-highlighted]': {
    // when selected, show the border of the selected button and hide the border of the following button
    borderRightWidth: 1,
    '& + *': {
      borderLeftWidth: 0,
    },
  },
});
