import type { DesignObject } from "@/types";

/**
 * Decorative objects for the invite image builder. Assets in public/design-objects/.
 */
const BASE = "/design-objects";

export const DESIGN_OBJECTS: DesignObject[] = [
  {
    id: "divider-line",
    name: "Divider line",
    eventType: "generic",
    url: `${BASE}/divider-line.svg`,
    tags: ["divider", "line"],
  },
  {
    id: "corner-minimal",
    name: "Corner accent",
    eventType: "generic",
    url: `${BASE}/corner-minimal.svg`,
    tags: ["corner", "minimal"],
  },
  {
    id: "floral-corner",
    name: "Floral corner",
    eventType: "wedding",
    url: `${BASE}/floral-corner.svg`,
    tags: ["corner", "wedding", "floral"],
  },
  {
    id: "confetti",
    name: "Confetti",
    eventType: "birthday",
    url: `${BASE}/confetti.svg`,
    tags: ["birthday", "party"],
  },
  {
    id: "heart",
    name: "Heart",
    eventType: "wedding",
    url: `${BASE}/heart.svg`,
    tags: ["wedding", "love"],
  },
  {
    id: "star",
    name: "Star",
    eventType: "birthday",
    url: `${BASE}/star.svg`,
    tags: ["birthday", "party"],
  },
  {
    id: "cake",
    name: "Cake",
    eventType: "birthday",
    url: `${BASE}/cake.svg`,
    tags: ["birthday", "celebration"],
  },
  {
    id: "balloon",
    name: "Balloon",
    eventType: "party",
    url: `${BASE}/balloon.svg`,
    tags: ["party", "birthday"],
  },
];

export function getDesignObjects(eventType?: string): DesignObject[] {
  if (!eventType || eventType === "generic") {
    return DESIGN_OBJECTS;
  }
  return DESIGN_OBJECTS.filter(
    (o) => o.eventType === eventType || o.eventType === "generic"
  );
}

export function getDesignObject(id: string): DesignObject | null {
  return DESIGN_OBJECTS.find((o) => o.id === id) ?? null;
}
