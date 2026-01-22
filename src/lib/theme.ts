/**
 * Theme system utilities
 * Provides type-safe access to theme colors and values
 */

export const theme = {
  // Backgrounds
  bg: {
    primary: "var(--bg-primary)",
    secondary: "var(--bg-secondary)",
    tertiary: "var(--bg-tertiary)",
    overlay: "var(--bg-overlay)",
    button: "var(--bg-button)",
  },

  // Text Colors
  text: {
    primary: "var(--text-primary)",
    secondary: "var(--text-secondary)",
    tertiary: "var(--text-tertiary)",
    inverse: "var(--text-inverse)",
  },

  // Borders
  border: {
    primary: "var(--border-primary)",
    light: "var(--border-light)",
    lighter: "var(--border-lighter)",
    accent: "var(--border-accent)",
  },

  // Shadows
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
  },

  // Cards & Components
  card: {
    bg: "var(--card-bg)",
    border: "var(--card-border)",
  },

  input: {
    bg: "var(--input-bg)",
    border: "var(--input-border)",
    text: "var(--input-text)",
  },

  // Accents & Game UI
  accent: {
    primary: "var(--accent-primary)",
    secondary: "var(--accent-secondary)",
  },

  ui: {
    glow: "var(--ui-glow)",
    shape: {
      primary: "var(--ui-shape-primary)",
      hover: "var(--ui-shape-hover)",
    },
    corner: "var(--ui-corner)",
    scan: "var(--ui-scan)",
    grid: "var(--ui-grid)",
  },

  // Status Colors
  status: {
    success: "var(--status-success)",
    error: "var(--status-error)",
    warning: "var(--status-warning)",
    info: "var(--status-info)",
  },

  // Gradients
  gradient: {
    header: "var(--gradient-header)",
    info: "var(--gradient-info)",
    toast: "var(--gradient-toast)",
  },
} as const;

/**
 * Utility function to safely use theme variables in inline styles
 * Usage: style={{ color: themeVar('text.primary') }}
 */
export function themeVar(path: string): string {
  const parts = path.split(".");
  let current: any = theme;

  for (const part of parts) {
    current = current[part];
  }

  return current || "";
}
