import { ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }
}

// A more refined and professional theme for FarmIQ
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
    borderRadius: 12, // Modern rounded corners
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
    MuiCard: {
        defaultProps: {
            elevation: 0,
        },
        styleOverrides: {
            root: {
                border: '1px solid',
                borderColor: mode === 'light' ? '#E2E8F0' : '#334155', // Slate 200 / 700
                borderRadius: 16, // Rounded cards
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: mode === 'light' 
                        ? '0 8px 25px rgba(0, 0, 0, 0.1)' 
                        : '0 8px 25px rgba(0, 0, 0, 0.3)',
                }
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
                borderRadius: 12, // Rounded papers
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                borderRadius: 12, // Rounded inputs
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'light' ? '#94A3B8' : '#64748B', // Slate 400 / 500
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: mode === 'light' ? '#2E7D32' : '#66BB6A',
                    borderWidth: '2px',
                },
            },
            notchedOutline: {
                borderColor: mode === 'light' ? '#E2E8F0' : '#475569', // Slate 200 / 600
            }
        }
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: 20, // Pill-shaped chips
                fontWeight: 600,
                fontSize: '0.75rem',
            }
        }
    },
    MuiAvatar: {
        styleOverrides: {
            root: {
                borderRadius: 12, // Rounded avatars
            }
        }
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 12, // Rounded buttons
                textTransform: 'none',
                fontWeight: 600,
                padding: '8px 24px',
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: mode === 'light' 
                        ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.3)',
                },
            },
            containedPrimary: {
                background: mode === 'light' 
                    ? 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)'
                    : 'linear-gradient(135deg, #66BB6A 0%, #81C784 100%)',
                '&:hover': {
                    background: mode === 'light' 
                        ? 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)'
                        : 'linear-gradient(135deg, #388E3C 0%, #66BB6A 100%)',
                }
            },
            containedSecondary: {
                background: mode === 'light' 
                    ? 'linear-gradient(135deg, #FFA000 0%, #FFC107 100%)'
                    : 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
                '&:hover': {
                    background: mode === 'light' 
                        ? 'linear-gradient(135deg, #FF8F00 0%, #FFA000 100%)'
                        : 'linear-gradient(135deg, #FFA000 0%, #FFC107 100%)',
                }
            }
        }
    },
    MuiLinearProgress: {
        styleOverrides: {
            root: {
                borderRadius: 6, // Rounded progress bars
                height: 8,
            }
        }
    },
    MuiAlert: {
        styleOverrides: {
            root: {
                borderRadius: 12, // Rounded alerts
                fontWeight: 500,
            }
        }
    },
  },
});

