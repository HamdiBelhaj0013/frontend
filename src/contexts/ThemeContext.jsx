import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create context
export const ColorModeContext = createContext({
    toggleColorMode: () => {},
    mode: 'light',
});

// Hook to use the color mode context
export const useColorMode = () => useContext(ColorModeContext);

export const ThemeContextProvider = ({ children }) => {
    // Check local storage for saved preference
    const storedMode = localStorage.getItem('themeMode');
    const [mode, setMode] = useState(storedMode === 'dark' ? 'dark' : 'light');

    // Theme toggling function
    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('themeMode', newMode);
                    return newMode;
                });
            },
            mode,
        }),
        [mode]
    );

    // Generate the theme based on the current mode
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light mode palette
                            primary: {
                                main: '#00897B',
                                light: '#4DB6AC',
                                dark: '#00695C',
                            },
                            secondary: {
                                main: '#26A69A',
                            },
                            background: {
                                default: '#f5f7fa',
                                paper: '#ffffff',
                            },
                            text: {
                                primary: 'rgba(0, 0, 0, 0.87)',
                                secondary: 'rgba(0, 0, 0, 0.6)',
                            },
                        }
                        : {
                            // Dark mode palette
                            primary: {
                                main: '#4DB6AC',
                                light: '#80CBC4',
                                dark: '#00897B',
                            },
                            secondary: {
                                main: '#26A69A',
                            },
                            background: {
                                default: '#121212',
                                paper: '#1E1E1E',
                            },
                            text: {
                                primary: 'rgba(255, 255, 255, 0.87)',
                                secondary: 'rgba(255, 255, 255, 0.6)',
                            },
                        }),
                },
                shape: {
                    borderRadius: 12,
                },
                typography: {
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    button: {
                        textTransform: 'none',
                    },
                },
                components: {
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                background: mode === 'dark'
                                    ? 'linear-gradient(135deg, rgba(0, 105, 92, 0.9), rgba(0, 77, 64, 0.95))'
                                    : 'linear-gradient(135deg, rgba(0, 137, 123, 0.95), rgba(0, 105, 92, 0.9))',
                                backdropFilter: 'blur(10px)',
                            },
                        },
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                backgroundColor: mode === 'dark' ? '#1E1E1E' : 'rgba(255, 255, 255, 0.95)',
                                backgroundImage: mode === 'dark'
                                    ? 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
                                    : 'none',
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                boxShadow: mode === 'dark'
                                    ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                                    : '0 2px 20px rgba(0, 0, 0, 0.05)',
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    // Apply preferred color scheme from system on initial load
    useEffect(() => {
        // If no stored preference, check system preference
        if (!storedMode) {
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setMode(prefersDarkMode ? 'dark' : 'light');
            localStorage.setItem('themeMode', prefersDarkMode ? 'dark' : 'light');
        }
    }, [storedMode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default ThemeContextProvider;