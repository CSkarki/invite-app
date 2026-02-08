"use client";

import { useState, useEffect, useRef, useCallback, useMemo, PointerEvent as ReactPointerEvent } from "react";
import type { DesignTemplate, DesignObject, UserObject } from "@/types";
import styles from "./InviteImageBuilder.module.css";

const CANVAS_W = 1080;
const CANVAS_H = 1350;
const OBJ_SIZE = 120;
const HIT_PADDING = 40;

interface TextState {
  title: string;
  date: string;
  tagline: string;
  [key: string]: string;
}

interface CustomColors {
  from: string;
  to: string;
  color: string;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function filterObjectsByEventType(objects: DesignObject[], eventType?: string): DesignObject[] {
  if (!eventType || eventType === "generic") return objects;
  return objects.filter(
    (o) => o.eventType === eventType || o.eventType === "generic"
  );
}

interface InviteImageBuilderProps {
  onClose: () => void;
  onApply: (url: string) => void;
}

export default function InviteImageBuilder({ onClose, onApply }: InviteImageBuilderProps) {
  const [step, setStep] = useState<"templates" | "design">("templates");
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [objects, setObjects] = useState<DesignObject[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [text, setText] = useState<TextState>({ title: "", date: "", tagline: "" });
  const [userObjects, setUserObjects] = useState<UserObject[]>([]);
  const [objectImages, setObjectImages] = useState<Record<string, HTMLImageElement | null>>({});
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [photoObjectUrl, setPhotoObjectUrl] = useState<string | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const [customColors, setCustomColors] = useState<CustomColors>({ from: "", to: "", color: "" });
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  if (photoObjectUrl !== photoUrlRef.current) photoUrlRef.current = photoObjectUrl;

  const getCanvasCoords = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x01: 0, y01: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (clientX == null) return { x01: 0, y01: 0 };
    const cx = (clientX - rect.left) * scaleX;
    const cy = (clientY - rect.top) * scaleY;
    return { x01: cx / CANVAS_W, y01: cy / CANVAS_H };
  }, []);

  const hitTestUserObject = useCallback((x01: number, y01: number): string | null => {
    const w = CANVAS_W;
    const h = CANVAS_H;
    const cx = x01 * w;
    const cy = y01 * h;
    for (let i = userObjects.length - 1; i >= 0; i--) {
      const o = userObjects[i];
      const s = (o.scale ?? 1) * OBJ_SIZE;
      const pad = Math.max(HIT_PADDING, s * 0.5);
      const left = o.x * w - s / 2 - pad;
      const top = o.y * h - s / 2 - pad;
      const size = s + pad * 2;
      if (cx >= left && cx <= left + size && cy >= top && cy <= top + size) {
        return o.id;
      }
    }
    return null;
  }, [userObjects]);

  const handleCanvasPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const { x01, y01 } = getCanvasCoords(e);
      const id = hitTestUserObject(x01, y01);
      if (id) {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setSelectedObjectId(id);
        setIsDragging(true);
      }
    },
    [getCanvasCoords, hitTestUserObject]
  );

  const handleCanvasPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const { x01, y01 } = getCanvasCoords(e);
      if (isDragging && selectedObjectId) {
        e.preventDefault();
        setUserObjects((prev) =>
          prev.map((o) =>
            o.id === selectedObjectId
              ? { ...o, x: Math.max(0, Math.min(1, x01)), y: Math.max(0, Math.min(1, y01)) }
              : o
          )
        );
      } else {
        const id = hitTestUserObject(x01, y01);
        setHoveredObjectId(id);
      }
    },
    [getCanvasCoords, hitTestUserObject, isDragging, selectedObjectId]
  );

  const handleCanvasPointerUp = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }
    setSelectedObjectId(null);
    setIsDragging(false);
  }, []);

  const handleCanvasPointerLeave = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    setHoveredObjectId(null);
    if (isDragging) {
      try {
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignored
      }
      setSelectedObjectId(null);
      setIsDragging(false);
    }
  }, [isDragging]);

  const template = templates.find((t) => t.id === templateId) || null;
  const filteredObjects = useMemo(
    () => filterObjectsByEventType(objects, template?.eventType),
    [objects, template?.eventType]
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/design-templates").then((r) => r.json()),
      fetch("/api/design-objects").then((r) => r.json()),
    ])
      .then(([t, o]) => {
        setTemplates(Array.isArray(t) ? t : []);
        setObjects(Array.isArray(o) ? o : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!template) return;
    const titleLayer = template.textLayers?.find((l) => l.id === "title");
    const dateLayer = template.textLayers?.find((l) => l.id === "date");
    const taglineLayer = template.textLayers?.find((l) => l.id === "tagline");
    setText({
      title: titleLayer?.defaultText ?? "",
      date: dateLayer?.defaultText ?? "",
      tagline: taglineLayer?.defaultText ?? "",
    });
    setUserObjects([]);
    setPhotoImage(null);
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
      setPhotoObjectUrl(null);
    }
    const bg = template.background || {};
    setCustomColors({
      from: bg.type === "gradient" ? (bg.from ?? "") : "",
      to: bg.type === "gradient" ? (bg.to ?? "") : "",
      color: bg.type === "solid" ? (bg.color ?? "") : "",
    });
  }, [templateId, template]);

  useEffect(() => {
    return () => {
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    };
  }, []);

  const loadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url.startsWith("http") ? url : window.location.origin + url;
    });
  }, []);

  useEffect(() => {
    const urls = [...new Set(objects.map((o) => o.url).filter(Boolean))];
    const load = async () => {
      const map: Record<string, HTMLImageElement | null> = {};
      for (const url of urls) {
        try {
          map[url] = await loadImage(url);
        } catch {
          map[url] = null;
        }
      }
      setObjectImages(map);
    };
    load();
  }, [objects, loadImage]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!template || !ctx) return;
      const w = CANVAS_W;
      const h = CANVAS_H;

      ctx.clearRect(0, 0, w, h);

      const bg = template.background || {};
      const from = customColors.from || bg.from || "#fff";
      const to = customColors.to || bg.to || "#f5f5f5";
      const solidColor = customColors.color || bg.color || "#ffffff";
      if (bg.type === "gradient") {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, from);
        g.addColorStop(1, to);
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = solidColor;
      }
      ctx.fillRect(0, 0, w, h);

      const slot = template.photoSlot;
      if (slot && photoImage) {
        const sx = slot.x * w;
        const sy = slot.y * h;
        const sw = slot.width * w;
        const sh = slot.height * h;
        ctx.save();
        if (slot.shape === "circle") {
          const r = Math.min(sw, sh) / 2;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.clip();
        } else {
          const r = Math.min(sw, sh) * 0.1;
          const x = sx - sw / 2;
          const y = sy - sh / 2;
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(x, y, sw, sh, r);
          } else {
            ctx.rect(x, y, sw, sh);
          }
          ctx.clip();
        }
        const img = photoImage;
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const scale = Math.max(sw / iw, sh / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.drawImage(img, 0, 0, iw, ih, sx - dw / 2, sy - dh / 2, dw, dh);
        ctx.restore();
      }

      const drawObj = (assetId: string, x: number, y: number, scale: number) => {
        const obj = objects.find((o) => o.id === assetId);
        if (!obj) return;
        const img = objectImages[obj.url];
        if (!img) return;
        const s = (scale || 1) * OBJ_SIZE;
        const dx = x * w - s / 2;
        const dy = y * h - s / 2;
        ctx.drawImage(img, dx, dy, s, s);
      };

      (template.objectSlots || [])
        .filter((s) => s.default)
        .forEach((s) => drawObj(s.assetId, s.x, s.y, s.scale));
      userObjects.forEach((o) => drawObj(o.assetId, o.x, o.y, o.scale ?? 1));

      if (selectedObjectId) {
        const o = userObjects.find((u) => u.id === selectedObjectId);
        if (o) {
          const s = (o.scale ?? 1) * OBJ_SIZE;
          const dx = o.x * w - s / 2;
          const dy = o.y * h - s / 2;
          ctx.strokeStyle = "rgba(0,0,0,0.4)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(dx - 2, dy - 2, s + 4, s + 4);
          ctx.setLineDash([]);
        }
      }

      (template.textLayers || []).forEach((layer) => {
        let value =
          text[layer.id] ??
          (layer.id === "title"
            ? text.title
            : layer.id === "date"
              ? text.date
              : text.tagline);
        if (value == null) value = layer.defaultText ?? "";
        ctx.font = `${layer.fontWeight || "400"} ${layer.fontSize || 24}px "${layer.fontFamily || "Cormorant Garamond"}"`;
        ctx.fillStyle = layer.color || "#333";
        ctx.textAlign = layer.textAlign as CanvasTextAlign || "center";
        ctx.textBaseline = "middle";
        const maxW = (layer.maxWidth ?? 0.9) * w;
        const lines = wrapText(ctx, value, maxW);
        const lineHeight = (layer.fontSize || 24) * 1.2;
        const startY = layer.y * h - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, i) => {
          ctx.fillText(line, layer.x * w, startY + i * lineHeight);
        });
      });
    },
    [template, text, userObjects, objects, objectImages, customColors, photoImage, selectedObjectId]
  );

  useEffect(() => {
    if (step !== "design" || !template) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    document.fonts.load('16px "Cormorant Garamond"').then(() => draw(ctx));
  }, [step, template, text, userObjects, objectImages, selectedObjectId, draw]);

  const addObject = (obj: DesignObject) => {
    setUserObjects((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        assetId: obj.id,
        x: 0.5,
        y: 0.5,
        scale: 1.2,
      },
    ]);
  };

  const handleExport = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setExporting(true);
    setError("");
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png", 1)
      );
      if (!blob) throw new Error("Failed to create image");
      const file = new File([blob], "invite.png", { type: "image/png" });
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      onApply?.(data.url);
      onClose?.();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (step === "templates") {
    return (
      <div className={styles.overlay} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>Design with template</h2>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              &times;
            </button>
          </div>
          <p className={styles.subtitle}>Choose a base template</p>
          <div className={styles.templateGrid}>
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.templateCard}
                onClick={() => {
                  setTemplateId(t.id);
                  setStep("design");
                }}
              >
                <span className={styles.templateName}>{t.name}</span>
              </button>
            ))}
          </div>
          <div className={styles.footer}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modalLarge}>
        <div className={styles.header}>
          <h2 className={styles.title}>Customize your invite image</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.designRow}>
          <div className={styles.canvasWrap}>
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              width={CANVAS_W}
              height={CANVAS_H}
              style={{
                maxWidth: "100%",
                height: "auto",
                touchAction: "none",
                cursor:
                  isDragging ? "grabbing" : hoveredObjectId ? "grab" : "default",
              }}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerLeave}
              onPointerCancel={handleCanvasPointerUp}
            />
          </div>
          <div className={styles.sidebar}>
            <section className={styles.sideSection}>
              <h3 className={styles.sideSectionTitle}>Text</h3>
              <label className={styles.sideLabel}>Title</label>
              <input
                type="text"
                className={styles.sideInput}
                value={text.title}
                onChange={(e) => setText((p) => ({ ...p, title: e.target.value }))}
                placeholder="Event name"
              />
              <label className={styles.sideLabel}>Date</label>
              <input
                type="text"
                className={styles.sideInput}
                value={text.date}
                onChange={(e) => setText((p) => ({ ...p, date: e.target.value }))}
                placeholder="Date & time"
              />
              <label className={styles.sideLabel}>Tagline</label>
              <input
                type="text"
                className={styles.sideInput}
                value={text.tagline}
                onChange={(e) =>
                  setText((p) => ({ ...p, tagline: e.target.value }))
                }
                placeholder="Short line"
              />
            </section>
            {template?.photoSlot && (
              <section className={styles.sideSection}>
                <h3 className={styles.sideSectionTitle}>Your photo</h3>
                <div className={styles.photoRow}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.fileInput}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
                      const url = URL.createObjectURL(f);
                      setPhotoObjectUrl(url);
                      const img = new window.Image();
                      img.onload = () => setPhotoImage(img);
                      img.src = url;
                      e.target.value = "";
                    }}
                  />
                  {photoImage ? (
                    <button
                      type="button"
                      className={styles.removePhotoBtn}
                      onClick={() => {
                        setPhotoImage(null);
                        if (photoObjectUrl) {
                          URL.revokeObjectURL(photoObjectUrl);
                          setPhotoObjectUrl(null);
                        }
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <span className={styles.uploadHint}>JPG/PNG/WebP</span>
                  )}
                </div>
              </section>
            )}
            <section className={styles.sideSection}>
              <h3 className={styles.sideSectionTitle}>Colors</h3>
              <div className={styles.colorRow}>
                {template?.background?.type === "gradient" ? (
                  <>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={customColors.from || "#ffffff"}
                      onChange={(e) =>
                        setCustomColors((p) => ({ ...p, from: e.target.value }))
                      }
                      title="Top"
                    />
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={customColors.to || "#f5f5f5"}
                      onChange={(e) =>
                        setCustomColors((p) => ({ ...p, to: e.target.value }))
                      }
                      title="Bottom"
                    />
                  </>
                ) : template?.background ? (
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={customColors.color || "#ffffff"}
                    onChange={(e) =>
                      setCustomColors((p) => ({ ...p, color: e.target.value }))
                    }
                  />
                ) : null}
              </div>
            </section>
            <section className={styles.sideSection}>
              <h3 className={styles.sideSectionTitle}>Decoration</h3>
              <div className={styles.objectPalette}>
                {filteredObjects.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    className={styles.objBtn}
                    onClick={() => addObject(obj)}
                    title={obj.name}
                  >
                    {obj.name}
                  </button>
                ))}
              </div>
              {userObjects.length > 0 && (
                <>
                  <p className={styles.dragHint}>Drag on canvas to move</p>
                  <ul className={styles.placedList}>
                    {userObjects.map((o) => {
                      const obj = objects.find((ob) => ob.id === o.assetId);
                      return (
                        <li key={o.id} className={styles.placedItem}>
                          <span className={styles.placedName}>
                            {obj?.name ?? o.assetId}
                          </span>
                          <button
                            type="button"
                            className={styles.removeObjBtn}
                            onClick={() =>
                              setUserObjects((prev) =>
                                prev.filter((item) => item.id !== o.id)
                              )
                            }
                            title="Remove"
                          >
                            &times;
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </section>
            {error && <p className={styles.errText}>{error}</p>}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "Uploading\u2026" : "Apply to invite"}
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
