import { extendTheme } from '@chakra-ui/react';

// ─── Kongo Cosmogram ─────────────────────────────────────────────────────────
// A palette rooted in Kongo material culture: bark-cloth umber for neutrals,
// fired terracotta as the primary accent, brass for secondary highlights, and
// natural indigo dye reserved for quiet, informational moments.
//
// Note: the dikenga watermark pattern lives in index.css, not here — Chakra's
// `backgroundImage` style prop runs values through its gradient-token parser,
// which mis-splits on the literal comma inside a `data:` URI.

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    heading: `'Fraunces', Georgia, serif`,
    body: `'Work Sans', -apple-system, sans-serif`,
  },
  colors: {
    // warm bark/umber neutral scale replaces Chakra's cold default gray
    gray: {
      50: '#F8F2E7',
      100: '#F0E6D2',
      200: '#E2D0AC',
      300: '#CBB483',
      400: '#AD9264',
      500: '#8C7350',
      600: '#6B5A42',
      700: '#4C4030',
      800: '#2E2620',
      900: '#18130E',
    },
    // fired terracotta replaces Chakra's default "blue" — this recolors every
    // colorScheme="blue" button/badge/focus-ring across the app in one place
    blue: {
      50: '#FBE9DF',
      100: '#F5CFB8',
      200: '#ECAE86',
      300: '#E08B5C',
      400: '#D06F3E',
      500: '#C1502E',
      600: '#A03F22',
      700: '#7D311B',
      800: '#5C2415',
      900: '#3A160D',
    },
    // brass/gold replaces "teal" — secondary accent (audio, relationships, stats)
    teal: {
      50: '#FBF3DD',
      100: '#F3E2AE',
      200: '#E9CC7C',
      300: '#DCB454',
      400: '#C99A3A',
      500: '#B07F27',
      600: '#8C641E',
      700: '#6A4B17',
      800: '#4A3510',
      900: '#2C1F09',
    },
    // natural indigo dye — used sparingly for quiet accents & the dikenga mark
    indigo: {
      50: '#E7EAF6',
      100: '#C3CBE8',
      200: '#98A6D6',
      300: '#6D80C2',
      400: '#4C60AC',
      500: '#39478C',
      600: '#2C3670',
      700: '#212853',
      800: '#171C39',
      900: '#0D1021',
    },
  },
  semanticTokens: {
    colors: {
      'bg-canvas': { default: 'gray.50', _dark: 'gray.900' },
      'bg-surface': { default: 'white', _dark: 'gray.800' },
      'bg-surface-raised': { default: 'gray.50', _dark: 'gray.700' },
      'border-default': { default: 'gray.200', _dark: 'gray.700' },
      'text-primary': { default: 'gray.800', _dark: 'gray.50' },
      'text-muted': { default: 'gray.600', _dark: 'gray.400' },
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bgColor: 'bg-canvas',
        color: 'text-primary',
      },
      '::selection': {
        background: props.colorMode === 'dark' ? 'blue.700' : 'blue.200',
        color: props.colorMode === 'dark' ? 'gray.50' : 'gray.900',
      },
      '*::-webkit-scrollbar': {
        width: '10px',
        height: '10px',
      },
      '*::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '*::-webkit-scrollbar-thumb': {
        background: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
        borderRadius: 'full',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        letterSpacing: '0.01em',
      },
    },
    Input: {
      defaultProps: { focusBorderColor: 'blue.400' },
    },
    Select: {
      defaultProps: { focusBorderColor: 'blue.400' },
    },
    Textarea: {
      defaultProps: { focusBorderColor: 'blue.400' },
    },
    NumberInput: {
      defaultProps: { focusBorderColor: 'blue.400' },
    },
    Heading: {
      baseStyle: {
        fontWeight: '600',
      },
    },
    Badge: {
      baseStyle: {
        letterSpacing: '0.04em',
      },
    },
  },
});

export default theme;
