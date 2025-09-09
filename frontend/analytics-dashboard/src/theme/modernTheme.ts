import { createTheme, ThemeOptions } from '@mui/material/styles';

// Modern Green Agriculture Theme
const modernThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Deep forest green
      light: '#4CAF50', // Bright green
      dark: '#1B5E20', // Dark forest green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8BC34A', // Light green
      light: '#AED581', // Very light green
      dark: '#689F38', // Dark light green
      contrastText: '#ffffff',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    warning: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#F44336',
      light: '#EF5350',
      dark: '#D32F2F',
    },
    info: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    background: {
      default: '#F8F9FA', // Very light gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A', // Almost black
      secondary: '#6C757D', // Medium gray
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12, // More rounded corners
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#BDBDBD #F5F5F5',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 4,
            backgroundColor: '#BDBDBD',
            '&:hover': {
              backgroundColor: '#9E9E9E',
            },
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: '#F5F5F5',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(46, 125, 50, 0.04)',
          },
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
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1A1A1A',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(46, 125, 50, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.16)',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#2E7D32',
            '& + .MuiSwitch-track': {
              backgroundColor: '#4CAF50',
            },
          },
        },
        track: {
          backgroundColor: '#E0E0E0',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            backgroundColor: '#2E7D32',
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(46, 125, 50, 0.16)',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: '#4CAF50',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#E0E0E0',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4CAF50',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2E7D32',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          color: '#2E7D32',
          '& .MuiAlert-icon': {
            color: '#4CAF50',
          },
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          color: '#F57C00',
          '& .MuiAlert-icon': {
            color: '#FF9800',
          },
        },
        standardError: {
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: '#D32F2F',
          '& .MuiAlert-icon': {
            color: '#F44336',
          },
        },
        standardInfo: {
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          color: '#1976D2',
          '& .MuiAlert-icon': {
            color: '#2196F3',
          },
        },
      },
    },
  },
};

export const modernTheme = createTheme(modernThemeOptions);

// Additional theme utilities
export const gradientBackgrounds = {
  primary: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
  secondary: 'linear-gradient(135deg, #8BC34A 0%, #AED581 100%)',
  success: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
  warning: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
  error: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
  info: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
  light: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)',
  dark: 'linear-gradient(135deg, #1A1A1A 0%, #424242 100%)',
};

export const glassMorphism = {
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
};

export const modernShadows = {
  small: '0 2px 8px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
  large: '0 8px 32px rgba(0, 0, 0, 0.16)',
  xlarge: '0 16px 64px rgba(0, 0, 0, 0.20)',
};

export default modernTheme;

