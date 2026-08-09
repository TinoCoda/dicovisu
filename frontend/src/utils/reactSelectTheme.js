import { useColorModeValue } from '@chakra-ui/react';

// react-select's `styles` prop takes real CSS values, not Chakra tokens —
// passing strings like "gray.700" (as several pages previously did via
// useColorModeValue) is invalid CSS and gets silently dropped, leaving the
// dropdown on browser-default (usually white) styling in dark mode. These
// are the actual hex values behind this app's Kongo Cosmogram theme tokens
// (see theme.js) so react-select stays visually consistent with Chakra.
const palette = {
  surface: { light: '#FFFFFF', dark: '#2E2620' },
  surfaceRaised: { light: '#F8F2E7', dark: '#4C4030' },
  border: { light: '#E2D0AC', dark: '#4C4030' },
  text: { light: '#2E2620', dark: '#F8F2E7' },
  accent: { light: '#C1502E', dark: '#D06F3E' },
  accentMuted: { light: '#FBE9DF', dark: '#5C2415' },
};

export function useReactSelectStyles() {
  const surface = useColorModeValue(palette.surface.light, palette.surface.dark);
  const surfaceRaised = useColorModeValue(palette.surfaceRaised.light, palette.surfaceRaised.dark);
  const border = useColorModeValue(palette.border.light, palette.border.dark);
  const text = useColorModeValue(palette.text.light, palette.text.dark);
  const accent = useColorModeValue(palette.accent.light, palette.accent.dark);
  const accentMuted = useColorModeValue(palette.accentMuted.light, palette.accentMuted.dark);
  const placeholderColor = useColorModeValue('#8C7350', '#AD9264');

  return {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: surface,
      borderColor: state.isFocused ? accent : border,
      boxShadow: state.isFocused ? `0 0 0 1px ${accent}` : 'none',
      '&:hover': { borderColor: accent },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: surface,
      border: `1px solid ${border}`,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? accentMuted : surface,
      color: text,
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: accentMuted,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: text,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: text,
      '&:hover': { backgroundColor: accent, color: '#FFFFFF' },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: text,
    }),
    input: (provided) => ({
      ...provided,
      color: text,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: placeholderColor,
    }),
  };
}
