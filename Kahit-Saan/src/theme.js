// src/theme.js
import { createTheme, alpha } from '@mui/material/styles';

// Style Guide Colors
const EERIE_BLACK = '#1A1A1A';
const QUICK_SILVER = '#A1A1A1';
const CUSTOM_WHITE = '#F7F7F7';
const GOLD = '#D4AF37';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: GOLD,
      contrastText: EERIE_BLACK,
    },
    secondary: {
      main: CUSTOM_WHITE, // For elements that need to be light on dark backgrounds
      contrastText: EERIE_BLACK,
    },
    background: {
      default: EERIE_BLACK, // Main page background is Eerie Black
      paper: EERIE_BLACK,   // Surfaces like Cards will also be Eerie Black to blend
    },
    text: {
      primary: CUSTOM_WHITE,   // Main text will be White
      secondary: QUICK_SILVER, // Secondary text will be Quick Silver
      disabled: alpha(CUSTOM_WHITE, 0.5),
    },
    action: {
      active: CUSTOM_WHITE,
      hover: alpha(CUSTOM_WHITE, 0.08),
      selected: alpha(CUSTOM_WHITE, 0.16),
      disabled: alpha(CUSTOM_WHITE, 0.3),
      disabledBackground: alpha(CUSTOM_WHITE, 0.12),
    },
    divider: alpha(CUSTOM_WHITE, 0.12),
    brand: {
      eerieBlack: EERIE_BLACK,
      quickSilver: QUICK_SILVER,
      customWhite: CUSTOM_WHITE,
      gold: GOLD,
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Montserrat", "Helvetica", "Arial", sans-serif',
    // H1: Montserrat, 36px, Bold
    h1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: '2.25rem', // 36px
      color: CUSTOM_WHITE,
    },
    // H2: Montserrat, 28px, Bold
    h2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 700,
      fontSize: '1.75rem', // 28px
      color: CUSTOM_WHITE,
    },
    // H3: Montserrat, 24px, Semi-Bold (Menu Item Name)
    h3: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600, // Style guide says Semi-Bold, image looks Bold. Let's try 700 for menu name.
      // fontWeight: 700, // For a bolder menu item name as in the image
      fontSize: '1.5rem', // 24px
      color: CUSTOM_WHITE, // Default, override to GOLD for menu item name
    },
    // P: Open Sans, 16px, Regular (Menu Item Description)
    body1: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 400,
      fontSize: '1rem', // 16px
      color: CUSTOM_WHITE, // Default
    },
    // Labels: Open Sans, 14px, Semi-Bold (e.g., for buttons, small text)
    body2: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 600, // Semi-bold for labels
      fontSize: '0.875rem', // 14px
      color: QUICK_SILVER, // Default for secondary text
    },
    button: {
      fontFamily: '"Open Sans", sans-serif',
      fontWeight: 600, // Semi-Bold
      fontSize: '0.875rem', // 14px
      textTransform: 'none',
    },
    // Price on Menu Item Card (Gold, Bold, Distinct)
    priceText: {
      fontFamily: '"Montserrat", sans-serif', // Or '"Open Sans", sans-serif'
      fontWeight: 700, // Bold
      fontSize: '1.375rem', // Approx 22px, adjust to match your "₱90" visual
      color: GOLD, // GOLD should be your #D4AF37 const
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: EERIE_BLACK,
          color: CUSTOM_WHITE,
          boxShadow: `0px 2px 4px -1px ${alpha(EERIE_BLACK, 0.2)}`, // Very subtle shadow for depth
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState, theme: currentTheme }) => ({
          borderRadius: '4px',
          padding: '8px 16px',
          // Clicked state from style guide: "solid background 25% opacity"
          ...(ownerState.variant === 'contained' && ownerState.color === 'primary' && {
            '&:active': { backgroundColor: alpha(GOLD, 0.25) },
          }),
          ...(ownerState.variant === 'contained' && ownerState.color === 'secondary' && {
             border: `1px solid ${alpha(QUICK_SILVER, 0.3)}`,
            '&:active': { backgroundColor: alpha(EERIE_BLACK, 0.25) },
          }),
        }),
        containedPrimary: { // Gold button
          backgroundColor: GOLD,
          color: EERIE_BLACK,
          '&:hover': { backgroundColor: alpha(GOLD, 0.85) },
        },
        containedSecondary: { // Eerie Black button with light text for general use
          backgroundColor: EERIE_BLACK,
          color: CUSTOM_WHITE,
          border: `1px solid ${alpha(QUICK_SILVER, 0.3)}`,
          '&:hover': { // Style guide hover: "no background, Top and Bottom margin 2px"
            backgroundColor: 'transparent',
            color: GOLD,
            borderColor: GOLD,
          },
        },
        text: ({ theme: currentTheme }) => ({ // For Navbar links
            color: CUSTOM_WHITE,
            fontFamily: '"Open Sans", sans-serif',
            fontWeight: 600, // Semi-bold for Labels
            fontSize: '0.875rem', // 14px
            padding: '8px 12px',
            textTransform: 'uppercase',
            '&:hover': {
                color: GOLD,
                backgroundColor: alpha(GOLD, 0.08), // Subtle gold glow on hover
            }
        }),
      },
    },
    MuiCard: { // For Menu Item Card
      styleOverrides: {
        root: {
          backgroundColor: EERIE_BLACK, // To blend with section background
          color: CUSTOM_WHITE,
          borderRadius: '0px', // Image shows sharp corners for the content block
          boxShadow: 'none',    // No shadow to make it blend
          padding: 0,           // Remove card padding if content handles it
        },
      },
    },
    MuiCardContent: { // If Card padding is 0, CardContent needs to handle it
        styleOverrides: {
            root: {
                padding: '16px', // Default is 16px, adjust as needed
                '&:last-child': { // Remove extra padding at the bottom of CardContent
                    paddingBottom: '16px',
                }
            }
        }
    },
    MuiPaper: {
        styleOverrides: {
            root: { // All paper surfaces default to Eerie Black
                 backgroundColor: EERIE_BLACK,
            }
        }
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                backgroundColor: EERIE_BLACK,
            }
        }
    },
    MuiListItemIcon: {
        styleOverrides: {
            root: { color: GOLD }
        }
    },
     MuiListItemText: {
        styleOverrides: {
            primary: { color: CUSTOM_WHITE }
        }
    },
    MuiLink: {
        styleOverrides: {
            root: {
                color: GOLD,
                textDecorationColor: alpha(GOLD, 0.5),
                '&:hover': { textDecorationColor: GOLD }
            }
        }
    }
  },
});

export default theme;