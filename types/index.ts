import type { User } from "@supabase/supabase-js";

// ── Invitation ──────────────────────────────────────────────────

export interface ThemeConfig {
  accentColor?: string;
  showSubtitle?: boolean;
}

export interface Invitation {
  id: string;
  userId: string;
  slug: string;
  eventName: string;
  eventDate: Date | string | null;
  eventTime: string | null;
  locationOrLink: string | null;
  message: string | null;
  imageUrl: string | null;
  themeId: string | null;
  themeConfig: ThemeConfig | null;
  ownerPlan: string | null;
  published: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  rsvps?: InviteRsvp[];
  _count?: { rsvps: number };
}

export interface InvitationFormValues {
  eventName: string;
  eventDate: string;
  eventTime: string;
  locationOrLink: string;
  message: string;
  imageUrl: string;
  slug: string;
  themeId: string;
  themeConfig: ThemeConfig;
}

// ── RSVP ────────────────────────────────────────────────────────

export interface InviteRsvp {
  id: string;
  invitationId: string;
  name: string;
  email: string;
  attending: string;
  message: string | null;
  createdAt: Date | string;
}

// ── Themes ──────────────────────────────────────────────────────

export type LayoutType = "classic" | "minimal" | "photo-heavy";

export interface Theme {
  id: string;
  name: string;
  layoutType: LayoutType;
  description: string;
  configSchema: Record<string, string>;
  previewImageUrl: string | null;
}

// ── Design Templates ────────────────────────────────────────────

export interface TextLayer {
  id: string;
  defaultText: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight?: string;
  color: string;
  textAlign: string;
  maxWidth: number;
}

export interface ObjectSlot {
  id: string;
  assetId: string;
  x: number;
  y: number;
  scale: number;
  default: boolean;
}

export interface PhotoSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "circle" | "roundedRect";
}

export interface DesignTemplateBackground {
  type: "gradient" | "solid";
  color?: string;
  from?: string;
  to?: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  eventType: string;
  aspectRatio: number;
  canvas: { width: number; height: number };
  background: DesignTemplateBackground;
  textLayers: TextLayer[];
  objectSlots: ObjectSlot[];
  photoSlot?: PhotoSlot;
}

// ── Design Objects ──────────────────────────────────────────────

export interface DesignObject {
  id: string;
  name: string;
  eventType: string;
  url: string;
  tags: string[];
}

export interface UserObject {
  id: string;
  assetId: string;
  x: number;
  y: number;
  scale: number;
}

// ── Auth ────────────────────────────────────────────────────────

export type AppUser = User;

export interface Session {
  user: AppUser;
}

export type AuthResult =
  | { ok: true; user: AppUser }
  | { ok: false; status: number };

// ── API ─────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
}

export interface ApiSuccess {
  ok: true;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}
