import { createTheme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
  }
}

// Enhanced breakpoints for better responsive design
const customBreakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

// Enhanced typography with responsive font sizes
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
};

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Clean indigo
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#10b981', // Clean emerald
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#06b6d4', // Clean cyan
      light: '#22d3ee',
      dark: '#0891b2',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  breakpoints: customBreakpoints,
  typography,
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderRadius: 16,
          border: '1px solid rgb(0 0 0 / 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 500,
          padding: '12px 24px',
          transition: 'all 0.2s ease-in-out',
          '@media (max-width: 600px)': {
            padding: '10px 20px',
            fontSize: '0.875rem',
          },
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderBottom: '1px solid rgb(0 0 0 / 0.05)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgb(0 0 0 / 0.08)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 0 0 1px rgb(99 102 241 / 0.3)',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 2px rgb(99 102 241 / 0.2)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'auto',
          maxWidth: '100%',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            padding: '8px 4px',
            fontSize: '0.75rem',
          },
        },
      },
    },
  },
};

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#818cf8',
      light: '#a5b4fc',
      dark: '#6366f1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#10b981',
      contrastText: '#ffffff',
    },
    tertiary: {
      main: '#22d3ee',
      light: '#67e8f9',
      dark: '#06b6d4',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f87171',
      light: '#fca5a5',
      dark: '#ef4444',
    },
    warning: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#f59e0b',
    },
    info: {
      main: '#60a5fa',
      light: '#93c5fd',
      dark: '#3b82f6',
    },
    success: {
      main: '#34d399',
      light: '#6ee7b7',
      dark: '#10b981',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
    },
  },
  breakpoints: customBreakpoints,
  typography,
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 #334155',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#334155',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#475569',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
          border: '1px solid rgb(255 255 255 / 0.1)',
          borderRadius: 16,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 25px -5px rgb(0 0 0 / 0.3), 0 4px 6px -2px rgb(0 0 0 / 0.3)',
            transform: 'translateY(-1px)',
            border: '1px solid rgb(255 255 255 / 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 500,
          padding: '12px 24px',
          transition: 'all 0.2s ease-in-out',
          '@media (max-width: 600px)': {
            padding: '10px 20px',
            fontSize: '0.875rem',
          },
        },
        contained: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
          '&:hover': {
            boxShadow: '0 8px 25px -5px rgb(0 0 0 / 0.3), 0 4px 6px -2px rgb(0 0 0 / 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          borderColor: 'rgb(255 255 255 / 0.2)',
          '&:hover': {
            borderWidth: '1.5px',
            borderColor: 'rgb(255 255 255 / 0.3)',
            backgroundColor: 'rgb(255 255 255 / 0.05)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgb(255 255 255 / 0.1)',
          backgroundColor: '#1e293b',
          boxShadow: '0 8px 25px -5px rgb(0 0 0 / 0.3), 0 4px 6px -2px rgb(0 0 0 / 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderBottom: '1px solid rgb(255 255 255 / 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            backgroundColor: 'rgb(255 255 255 / 0.03)',
            '&:hover': {
              backgroundColor: 'rgb(255 255 255 / 0.05)',
              boxShadow: '0 0 0 1px rgb(129 140 248 / 0.3)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgb(255 255 255 / 0.05)',
              boxShadow: '0 0 0 2px rgb(129 140 248 / 0.2)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
          borderRadius: 12,
          border: '1px solid rgb(255 255 255 / 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          backgroundColor: 'rgb(255 255 255 / 0.1)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'auto',
          maxWidth: '100%',
          backgroundColor: '#1e293b',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: 'rgb(255 255 255 / 0.1)',
          '@media (max-width: 600px)': {
            padding: '8px 4px',
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgb(255 255 255 / 0.05)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgb(129 140 248 / 0.15)',
            '&:hover': {
              backgroundColor: 'rgb(129 140 248 / 0.2)',
            },
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);