// ---- 도면 그리기 도구 (좌표: x 오른쪽 +, y 위 +, 단위 mm) ----
const r0 = v => Math.round(v * 10) / 10;
let DRAWINGS = [];
function arcPts(cx, cy, r, a0, a1) { if (r <= 0) return [[cx, cy]]; const n = Math.max(4, Math.round(Math.abs(a1 - a0) / 10)), o = []; for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; }
class D {
  constructor(fs) { this.a = []; this.g = []; this.fs = fs; this.b = [1e9, 1e9, -1e9, -1e9]; }
  e(x, y) { const b = this.b; if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; }
  line(x1, y1, x2, y2, c = 'o') { this.e(x1, y1); this.e(x2, y2); this.g.push({ t: 'L', x1, y1, x2, y2, c }); this.a.push(`<line x1="${r0(x1)}" y1="${r0(-y1)}" x2="${r0(x2)}" y2="${r0(-y2)}" class="${c}"/>`); return this; }
  rect(x, y, w, h, c = 'o w') { this.e(x, y); this.e(x + w, y + h); this.g.push({ t: 'P', pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], c }); this.a.push(`<rect x="${r0(x)}" y="${r0(-y - h)}" width="${r0(w)}" height="${r0(h)}" class="${c}"/>`); return this; }
  poly(pts, c = 'o w') { pts.forEach(p => this.e(p[0], p[1])); this.g.push({ t: 'P', pts, c }); this.a.push(`<polygon points="${pts.map(p => r0(p[0]) + ',' + r0(-p[1])).join(' ')}" class="${c}"/>`); return this; }
  circle(x, y, r, c = 'o p') { this.e(x - r, y - r); this.e(x + r, y + r); this.g.push({ t: 'C', x, y, r, c }); this.a.push(`<circle cx="${r0(x)}" cy="${r0(-y)}" r="${r0(r)}" class="${c}"/>`); return this; }
  path(d, c, ext) { (ext || []).forEach(p => this.e(p[0], p[1])); this.a.push(`<path d="${d}" class="${c}"/>`); return this; }
  cross(x, y, r) { return this.line(x - r, y, x + r, y, 'c').line(x, y - r, x, y + r, 'c'); }
  text(x, y, s, anchor = 'middle', c = '', rot = 0, k = 1) { const f = this.fs * k, w = String(s).length * f * 0.62; if (rot) { this.e(x - f, y - w / 2); this.e(x + f * 0.4, y + w / 2); } else { const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x; this.e(x0, y - f * 0.3); this.e(x0 + w, y + f); }
    this.g.push({ t: 'T', x, y, s: String(s), h: f, rot, anchor, c });
    this.a.push(`<text x="${r0(x)}" y="${r0(-y)}" font-size="${r0(f)}" text-anchor="${anchor}" class="${c}"${rot ? ` transform="rotate(${rot} ${r0(x)} ${r0(-y)})"` : ''}>${s}</text>`); return this; }
  dimH(x1, x2, y, off, label) { const ya = y + off, f = this.fs, t = f * 0.35, sg = Math.sign(off) || 1;
    this.line(x1, y + sg * f * 0.3, x1, ya + sg * f * 0.4, 'd').line(x2, y + sg * f * 0.3, x2, ya + sg * f * 0.4, 'd').line(x1, ya, x2, ya, 'd');
    this.line(x1 - t, ya - t, x1 + t, ya + t, 'd').line(x2 - t, ya - t, x2 + t, ya + t, 'd');
    return this.text((x1 + x2) / 2, ya + f * 0.3, label ?? r0(Math.abs(x2 - x1)), 'middle', 'dt'); }
  dimV(y1, y2, x, off, label) { const xa = x + off, f = this.fs, t = f * 0.35, sg = Math.sign(off) || 1;
    this.line(x + sg * f * 0.3, y1, xa + sg * f * 0.4, y1, 'd').line(x + sg * f * 0.3, y2, xa + sg * f * 0.4, y2, 'd').line(xa, y1, xa, y2, 'd');
    this.line(xa - t, y1 - t, xa + t, y1 + t, 'd').line(xa - t, y2 - t, xa + t, y2 + t, 'd');
    return this.text(xa - f * 0.3, (y1 + y2) / 2, label ?? r0(Math.abs(y2 - y1)), 'middle', 'dt', -90); }
  svg() { const b = this.b, m = this.fs * 1.2, w = b[2] - b[0] + 2 * m, h = b[3] - b[1] + 2 * m; DRAWINGS.push(this);
    return `<svg xmlns="http://www.w3.org/2000/svg" data-di="${DRAWINGS.length - 1}" data-w="${r0(w)}" data-h="${r0(h)}" viewBox="${r0(b[0] - m)} ${r0(-b[3] - m)} ${r0(w)} ${r0(h)}" style="aspect-ratio:${r0(w)}/${r0(h)}">${this.a.join('')}</svg>`; }
}
// ---- DXF (R12, 1:1, mm) ----
function toDXF(d) { const o = ['0', 'SECTION', '2', 'ENTITIES'], f = v => (Math.round(v * 1000) / 1000).toString();
  const lay = c => { const k = (c || '').split(' ')[0]; return k === 'h' ? 'HIDDEN' : k === 'c' ? 'CENTER' : k === 'd' || k === 'dt' ? 'DIM' : k === 'o' ? 'OUTLINE' : 'NOTE'; };
  for (const e of d.g) { const L = lay(e.c);
    if (e.t === 'L') o.push('0', 'LINE', '8', L, '10', f(e.x1), '20', f(e.y1), '11', f(e.x2), '21', f(e.y2));
    else if (e.t === 'C') o.push('0', 'CIRCLE', '8', L, '10', f(e.x), '20', f(e.y), '40', f(e.r));
    else if (e.t === 'P') { o.push('0', 'POLYLINE', '8', L, '66', '1', '70', '1'); for (const p of e.pts) o.push('0', 'VERTEX', '8', L, '10', f(p[0]), '20', f(p[1])); o.push('0', 'SEQEND'); }
    else if (e.t === 'T') { const s = e.s.replace(/Ø/g, '%%c').replace(/□/g, 'SQ ').replace(/×/g, 'x').replace(/·/g, '-'); if (/[^\x20-\x7e]/.test(s)) continue;
      const al = e.anchor === 'middle' ? 1 : e.anchor === 'end' ? 2 : 0; o.push('0', 'TEXT', '8', L, '10', f(e.x), '20', f(e.y), '40', f(e.h * 0.8), '1', s, '50', e.rot ? '90' : '0'); if (al) o.push('72', String(al), '11', f(e.x), '21', f(e.y)); } }
  o.push('0', 'ENDSEC', '0', 'EOF'); return o.join('\r\n') + '\r\n'; }
