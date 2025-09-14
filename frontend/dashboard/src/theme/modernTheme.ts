import { ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }
}

// A more refined and professional theme for FarmIQ™
export const modernTheme = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode Palette
          primary: {
            main: '#2E7D32',
            light: '#66BB6A',
            dark: '#1B5E20',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#FFA000',
            light: '#FFC107',
            dark: '#FF8F00',
            contrastText: '#ffffff',
          },
          neutral: {
            main: '#64748B',
            light: '#F1F5F9',
            dark: '#1E293B',
          },
          background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
          },
          text: {
            primary: '#0F172A',
            secondary: '#64748B',
          },
        }
      : {
          // Dark Mode Palette
          primary: {
            main: '#66BB6A',
            light: '#81C784',
            dark: '#388E3C',
            contrastText: '#000000',
          },
          secondary: {
            main: '#FFC107',
            light: '#FFD54F',
            dark: '#FFA000',
            contrastText: '#000000',
          },
          neutral: {
            main: '#94A3B8',
            light: '#334155',
            dark: '#E2E8F0',
          },
          background: {
            default: '#0F172A', // Slate 900
            paper: '#1E293B',   // Slate 800
          },
          text: {
            primary: '#F8FAFC', // Slate 50
            secondary: '#94A3B8', // Slate 400
          },
        }),
    action: {
      ... (mode === 'light'
        ? {
            active: '#64748B', // slate 500
            hover: 'rgba(0, 0, 0, 0.04)',
            selected: 'rgba(46, 125, 50, 0.08)', // Primary Green with low opacity
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
          }
        : {
            active: '#CBD5E1', // slate 300
            hover: 'rgba(255, 255, 255, 0.08)',
            selected: 'rgba(102, 187, 106, 0.16)', // Primary Green (light) with low opacity
            disabled: 'rgba(255, 255, 255, 0.3)',
            disabledBackground: 'rgba(255, 255, 255, 0.12)',
          }),
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.25rem', fontWeight: 700 },
    h2: { fontSize: '1.875rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.125rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 0, // A slightly more conventional border radius
  },
  components: {
    MuiCssBaseline: {
        styleOverrides: {
            body: {
                scrollbarColor: mode === 'light' ? '#94A3B8 #F1F5F9' : '#475569 #1E293B',
                '&::-webkit-scrollbar, & *::-webkit-scrollbar': { width: 8, height: 8 },
                '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                    borderRadius: 4,
                    backgroundColor: mode === 'light' ? '#CBD5E1' : '#475569', // Slate 300 / 600
                    minHeight: 24,
                },
                '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: mode === 'light' ? '#94A3B8' : '#64748B', // Slate 400 / 500
                },
            },
        },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
            '&:hover': {
                backgroundColor: mode === 'light' ? '#1B5E20' : '#388E3C',
            }
        },
      },
    },
    MuiCard: {
        defaultProps: {
            elevation: 0,
        },
        styleOverrides: {
            root: {
                border: '1px solid',
                borderColor: mode === 'light' ? '#E2E8F0' : '#334155', // Slate 200 / 700
            }
        }
    },
    MuiPaper: {
        defaultProps: {
            elevation: 0,
        },
        styleOverrides: {
            root: {
                border: '1px solid',
                borderColor: mode === 'light' ? '#E2E8F0' : '#334155', // Slate 200 / 700
            }
        }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
          color: mode === 'light' ? '#0F172A' : '#F8FAFC',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiListItemButton: {
        styleOverrides: {
          root: {
            margin: '4px 0',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
            root: {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'light' ? '#94A3B8' : '#64748B', // Slate 400 / 500
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'light' ? '#2E7D32' : '#66BB6A',
                    borderWidth: '1px',
                },
            },
            notchedOutline: {
                borderColor: mode === 'light' ? '#E2E8F0' : '#475569', // Slate 200 / 600
            }
        }
    },
  },
});

