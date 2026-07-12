import { createTheme } from "@mui/material/styles";

export function getTheme(mode = "light") {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#0f8b87",
        contrastText: "#f8fafc",
      },
      secondary: {
        main: mode === "dark" ? "#38dcca" : "#11253d",
      },
      success: {
        main: "#2cb67d",
      },
      error: {
        main: "#ef4444",
      },
      warning: {
        main: "#f59e0b",
      },
      background: {
        default: mode === "dark" ? "#0e1420" : "#f5f7fb",
        paper: mode === "dark" ? "#111827" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f8fafc" : "#0f172a",
        secondary: mode === "dark" ? "#94a3b8" : "#64748b",
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: ["Inter", "IBM Plex Mono", "Roboto", "Arial", "sans-serif"].join(","),
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 999,
            fontWeight: 700,
            boxShadow: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === "dark" ? "0 16px 40px rgba(2, 6, 23, 0.45)" : "0 16px 40px rgba(15, 23, 42, 0.06)",
            border: mode === "dark" ? "1px solid #243447" : "1px solid #e2e8f0",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },
    },
  });
}

const theme = getTheme("light");

export default theme;