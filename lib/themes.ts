import type { Theme } from "@/types";

/**
 * Invitation templates. Each has layoutType for renderer and configSchema for customization.
 */
export const THEMES: Theme[] = [
  {
    id: "classic",
    name: "Classic",
    layoutType: "classic",
    description: "Two-column layout with image and details side by side.",
    configSchema: { accentColor: "string", showSubtitle: "boolean" },
    previewImageUrl: null,
  },
  {
    id: "minimal",
    name: "Minimal",
    layoutType: "minimal",
    description: "Single column, image on top, clean typography.",
    configSchema: { accentColor: "string", showSubtitle: "boolean" },
    previewImageUrl: null,
  },
  {
    id: "photo-heavy",
    name: "Photo focus",
    layoutType: "photo-heavy",
    description: "Large cover image with overlay text.",
    configSchema: { accentColor: "string", showSubtitle: "boolean" },
    previewImageUrl: null,
  },
  {
    id: "elegant-split",
    name: "Elegant split",
    layoutType: "classic",
    description: "A refined two-column layout with elegant serif typography and muted tones.",
    configSchema: { accentColor: "string", showSubtitle: "boolean" },
    previewImageUrl: null,
  },
  {
    id: "full-bleed",
    name: "Full bleed",
    layoutType: "photo-heavy",
    description: "Edge-to-edge image with floating text overlay for dramatic visual impact.",
    configSchema: { accentColor: "string", showSubtitle: "boolean" },
    previewImageUrl: null,
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export const DEFAULT_THEME_ID = "classic";
