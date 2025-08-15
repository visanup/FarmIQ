// src/theme.ts
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import { red, grey, blue, pink, green, orange } from '@mui/material/colors';

// Create base theme to access default values
const baseTheme = createTheme();

// Override only specific shadow levels and retain the rest (total 25 entries)
const customShadows: Shadows = (baseTheme.shadows as Shadows).map((shadow, index) => {
  switch (index) {
    case 1:
      return '0px 1px 3px rgba(0,0,0,0.12), 0px 1px 2px rgba(0,0,0,0.24)';
    case 2:
      return '0px 3px 6px rgba(0,0,0,0.16), 0px 3px 6px rgba(0,0,0,0.23)';
    case 3:
      return '0px 10px 20px rgba(0,0,0,0.19), 0px 6px 6px rgba(0,0,0,0.23)';
    default:
      return shadow;
  }
}) as Shadows;

// Build the full theme
let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: blue[300],
      main:  blue[600],
      dark:  blue[800],
      contrastText: '#fff',
    },
    secondary: {
      light: pink[300],
      main:  pink[500],
      dark:  pink[700],
      contrastText: '#fff',
    },
    error: {
      light: red[300],
      main:  red[500],
      dark:  red[700],
      contrastText: '#fff',
    },
    warning: {
      light: orange[300],
      main:  orange[500],
      dark:  orange[700],
      contrastText: grey[900],
    },
    info: {
      light: blue[200],
      main:  blue[500],
      dark:  blue[700],
      contrastText: '#fff',
    },
    success: {
      light: green[300],
      main:  green[600],
      dark:  green[800],
      contrastText: grey[50],
    },
    background: {
      default: '#f4f6f8',
      paper:   '#ffffff',
    },
    text: {
      primary:   grey[900],
      secondary: grey[700],
      disabled:  grey[500],
    },
    divider: grey[200],
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 4,
  breakpoints: {
    values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 },
  },
  typography: {
    fontFamily: ['Roboto','Helvetica','Arial','sans-serif'].join(','),
    h1: { fontSize: '3rem', fontWeight: 300, lineHeight: 1.2 },
    h2: { fontSize: '2.5rem', fontWeight: 300, lineHeight: 1.3 },
    h3: { fontSize: '2rem', fontWeight: 400, lineHeight: 1.4 },
    h4: { fontSize: '1.75rem', fontWeight: 400, lineHeight: 1.5 },
    h5: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.6 },
    h6: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.6 },
    subtitle1: { fontSize: '1rem',    fontWeight: 400, lineHeight: 1.75 },
    subtitle2: { fontSize: '0.875rem',fontWeight: 500, lineHeight: 1.57 },
    body1: { fontSize: '1rem',    fontWeight: 400, lineHeight: 1.5 },
    body2: { fontSize: '0.875rem',fontWeight: 400, lineHeight: 1.43 },
    button: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
    overline: { fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', lineHeight: 2.66 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#f4f6f8', margin: 0, padding: 0 },
      },
    },
    MuiButton: {
      defaultProps: { variant: 'contained', disableElevation: true },
      styleOverrides: { root: { borderRadius: 8, padding: '10px 22px' } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 2 },
      styleOverrides: { colorPrimary: { backgroundImage: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)' } },
    },
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: { root: { borderRadius: 12, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' } },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 12, padding: '16px' } } },
    MuiTooltip: { defaultProps: { arrow: true, enterDelay: 300 } },
    MuiAvatar:  { styleOverrides: { root: { width: 40, height: 40 } } },
    MuiSnackbarContent: { styleOverrides: { root: { fontSize: '0.875rem' } } },
  },
  shadows: customShadows,
  transitions: {
    duration: { shortest:150, shorter:200, short:250, standard:300, complex:375, enteringScreen:225, leavingScreen:195 },
    easing:   { easeInOut:'cubic-bezier(0.4,0,0.2,1)', easeOut:'cubic-bezier(0.0,0,0.2,1)', easeIn:'cubic-bezier(0.4,0,1,1)', sharp:'cubic-bezier(0.4,0,0.6,1)' },
  },
  zIndex: { mobileStepper:1000, appBar:1100, drawer:1200, modal:1300, snackbar:1400, tooltip:1500 },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme, { breakpoints: ['xs','sm','md','lg','xl'], factor: 2 });

export default theme;
