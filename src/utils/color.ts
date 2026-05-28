/**
 * Clamps the HSL lightness of a hex color so it reads as text on glass-dim cards.
 * Dark-mode cards are near-black (~9% L) — text needs L ≥ 62%.
 * Light-mode cards are near-white (~96% L) — text needs L ≤ 38%.
 * Colors already within the target band pass through unchanged.
 */
export function clampEyebrowColor(hex: string, isDark: boolean): string {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const targetL = isDark ? Math.max(l, 0.62) : Math.min(l, 0.38);
  if (targetL === l) return hex;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 0.5) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q2 = targetL < 0.5 ? targetL * (1 + s) : targetL + s - targetL * s;
  const p2 = 2 * targetL - q2;
  const toHex = (c: number) => Math.round(Math.min(1, Math.max(0, hue2rgb(p2, q2, c))) * 255).toString(16).padStart(2, "0");
  return `#${toHex(h + 1 / 3)}${toHex(h)}${toHex(h - 1 / 3)}`;
}
